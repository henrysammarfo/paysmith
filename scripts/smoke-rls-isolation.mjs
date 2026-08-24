/**
 * RLS cross-tenant isolation smoke (must fail for attacker writes).
 * Requires .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   and VITE_SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANON_KEY
 *
 * Creates two ephemeral auth users + one victim wallet, then asserts
 * authenticated tenant A cannot read/update/delete B's wallet or insert B's txns.
 */
import fs from "fs";
import { randomUUID } from "crypto";

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  console.error("Missing SUPABASE_URL / SERVICE_ROLE / anon (publishable) key");
  process.exit(1);
}

const svc = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const stamp = Date.now();
const password = `RlsSmoke_${stamp}_Aa1!`;
const users = {
  a: { email: `rls-a-${stamp}@paysmith-test.local`, id: null, accessToken: null, developerId: null },
  b: { email: `rls-b-${stamp}@paysmith-test.local`, id: null, accessToken: null, developerId: null },
};

const results = [];
const assert = (name, pass, detail = {}) => {
  results.push({ name, pass: !!pass, ...detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}`, detail.status ?? "", detail.note ?? "");
};

async function adminCreateUser(email) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: svc,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`admin create ${email}: ${res.status} ${JSON.stringify(body)}`);
  return body.id;
}

async function adminDeleteUser(userId) {
  if (!userId) return;
  await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: svc,
  });
}

async function waitDeveloper(authId) {
  for (let i = 0; i < 20; i++) {
    const rows = await (
      await fetch(
        `${url}/rest/v1/developers?auth_id=eq.${authId}&select=id,email,auth_id`,
        { headers: svc },
      )
    ).json();
    if (rows?.[0]?.id) return rows[0];
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`developer row missing for auth ${authId}`);
}

async function passwordSignIn(email) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok || !body.access_token) {
    throw new Error(`signIn ${email}: ${res.status} ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

function userHdr(accessToken) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function cleanup() {
  for (const u of [users.a, users.b]) {
    if (u.developerId) {
      await fetch(`${url}/rest/v1/developers?id=eq.${u.developerId}`, {
        method: "DELETE",
        headers: svc,
      });
    }
    await adminDeleteUser(u.id);
  }
}

const main = async () => {
  let victimWalletId = null;
  const victimBalance = 777;

  try {
    users.a.id = await adminCreateUser(users.a.email);
    users.b.id = await adminCreateUser(users.b.email);

    const devA = await waitDeveloper(users.a.id);
    const devB = await waitDeveloper(users.b.id);
    users.a.developerId = devA.id;
    users.b.developerId = devB.id;

    victimWalletId = randomUUID();
    const created = await (
      await fetch(`${url}/rest/v1/agent_wallets`, {
        method: "POST",
        headers: svc,
        body: JSON.stringify({
          id: victimWalletId,
          owner_id: users.b.developerId,
          name: "RLS victim wallet",
          email: users.b.email,
          country: "GH",
          currency: "GHS",
          status: "active",
          balance_ghs: victimBalance,
          daily_cap: 1000,
          max_per_tx: 200,
        }),
      })
    ).json();
    if (!created?.[0]?.id) {
      throw new Error(`create victim wallet failed: ${JSON.stringify(created)}`);
    }

    users.a.accessToken = await passwordSignIn(users.a.email);
    const aHdr = userHdr(users.a.accessToken);

    // 1) SELECT cross-tenant wallet must return empty
    const selRes = await fetch(
      `${url}/rest/v1/agent_wallets?id=eq.${victimWalletId}&select=id,balance_ghs,owner_id`,
      { headers: aHdr },
    );
    const selRows = await selRes.json();
    assert("cross_tenant_select_empty", Array.isArray(selRows) && selRows.length === 0, {
      status: selRes.status,
      rows: selRows?.length,
    });

    // 2) UPDATE cross-tenant wallet must not change balance
    const patchRes = await fetch(`${url}/rest/v1/agent_wallets?id=eq.${victimWalletId}`, {
      method: "PATCH",
      headers: aHdr,
      body: JSON.stringify({ balance_ghs: 1 }),
    });
    const patchRows = await patchRes.json().catch(() => []);
    const after = await (
      await fetch(
        `${url}/rest/v1/agent_wallets?id=eq.${victimWalletId}&select=balance_ghs`,
        { headers: svc },
      )
    ).json();
    const bal = Number(after?.[0]?.balance_ghs);
    assert(
      "cross_tenant_update_blocked",
      patchRes.ok &&
        Array.isArray(patchRows) &&
        patchRows.length === 0 &&
        bal === victimBalance,
      {
        status: patchRes.status,
        returnedRows: Array.isArray(patchRows) ? patchRows.length : "n/a",
        balance_after: bal,
      },
    );

    // 3) INSERT txn onto victim wallet must fail
    const txnRes = await fetch(`${url}/rest/v1/transactions`, {
      method: "POST",
      headers: aHdr,
      body: JSON.stringify({
        agent_wallet_id: victimWalletId,
        type: "payout",
        recipient: "0550000000",
        amount: 1,
        currency: "GHS",
        method: "mobile_money",
        status: "pending",
        note: "rls isolation probe",
      }),
    });
    const txnBody = await txnRes.text();
    const txnInserted = txnRes.status >= 200 && txnRes.status < 300;
    assert("cross_tenant_txn_insert_blocked", !txnInserted, {
      status: txnRes.status,
      body: txnBody.slice(0, 180),
    });

    // 4) DELETE cross-tenant wallet must leave row intact
    const delRes = await fetch(`${url}/rest/v1/agent_wallets?id=eq.${victimWalletId}`, {
      method: "DELETE",
      headers: aHdr,
    });
    const still = await (
      await fetch(
        `${url}/rest/v1/agent_wallets?id=eq.${victimWalletId}&select=id`,
        { headers: svc },
      )
    ).json();
    assert("cross_tenant_delete_blocked", still?.[0]?.id === victimWalletId, {
      status: delRes.status,
      still_exists: !!still?.[0]?.id,
    });

    // Sanity: owner B can select own wallet
    users.b.accessToken = await passwordSignIn(users.b.email);
    const own = await (
      await fetch(
        `${url}/rest/v1/agent_wallets?id=eq.${victimWalletId}&select=id,balance_ghs`,
        { headers: userHdr(users.b.accessToken) },
      )
    ).json();
    assert("owner_select_own_wallet", own?.[0]?.id === victimWalletId, {
      rows: own?.length,
    });
  } finally {
    await cleanup();
  }

  const out = {
    at: new Date().toISOString(),
    victimWalletId,
    results,
  };
  fs.writeFileSync("memory/SMOKE_RLS.json", JSON.stringify(out, null, 2));
  console.log("\n" + JSON.stringify(out, null, 2));

  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.error("RLS isolation FAILED:", failed.map((r) => r.name).join(", "));
    process.exit(1);
  }
  console.log("RLS isolation PASS");
};

main().catch((err) => {
  console.error(err);
  cleanup().finally(() => process.exit(1));
});
