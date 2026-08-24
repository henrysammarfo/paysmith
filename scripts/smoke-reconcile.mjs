/**
 * Smoke: reconcile-ledger auth + orphan debit retry.
 * Requires .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WEBHOOK_INTERNAL_SECRET
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

const url = env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const internalSecret = env.WEBHOOK_INTERNAL_SECRET;
const hdr = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const email = process.env.SMOKE_DEV_EMAIL || "jasonneil4040@gmail.com";

const main = async () => {
  const checks = {};

  const unauth = await fetch(`${url}/functions/v1/reconcile-ledger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 1 }),
  });
  checks.unauth_401 = unauth.status === 401;

  const devs = await (
    await fetch(`${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=id`, { headers: hdr })
  ).json();
  const dev = devs[0];
  if (!dev?.id) throw new Error(`No developer for ${email}`);

  const wallets = await (
    await fetch(
      `${url}/rest/v1/agent_wallets?owner_id=eq.${dev.id}&status=eq.active&select=id,currency,balance_ghs,balance_ngn,balance_usd&limit=5`,
      { headers: hdr },
    )
  ).json();
  const wallet =
    wallets.find((w) => w.currency === "GHS" && Number(w.balance_ghs) >= 5) ||
    wallets.find((w) => w.currency === "NGN" && Number(w.balance_ngn) >= 5) ||
    wallets[0];
  if (!wallet) throw new Error("No wallet for reconcile smoke");

  const balCol =
    wallet.currency === "GHS" ? "balance_ghs" : wallet.currency === "NGN" ? "balance_ngn" : "balance_usd";
  let beforeBal = Number(wallet[balCol] ?? 0);
  const amount = 1;
  if (beforeBal < amount) {
    beforeBal = 10;
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}`, {
      method: "PATCH",
      headers: hdr,
      body: JSON.stringify({ [balCol]: beforeBal }),
    });
  }

  const orphanRail = `reconcile_smoke_${randomUUID().slice(0, 8)}`;
  const inserted = await (
    await fetch(`${url}/rest/v1/transactions`, {
      method: "POST",
      headers: hdr,
      body: JSON.stringify({
        agent_wallet_id: wallet.id,
        type: "send",
        recipient: "0550000001",
        amount,
        currency: wallet.currency === "USDC" ? "USDC" : wallet.currency,
        method: "mobile_money",
        status: "settled",
        rail_tx_id: orphanRail,
        provider: "reconcile_smoke",
        fee: 0,
        ledger_debited_at: null,
      }),
    })
  ).json();
  const tx = inserted[0];
  if (!tx?.id) throw new Error(`orphan insert failed: ${JSON.stringify(inserted)}`);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serviceKey}`,
    ...(internalSecret ? { "X-Paysmith-Internal-Secret": internalSecret } : {}),
  };

  const recon = await fetch(`${url}/functions/v1/reconcile-ledger`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ limit: 20 }),
  });
  const reconBody = await recon.json();
  checks.reconcile_ok = recon.ok && (reconBody.debited ?? 0) >= 1;
  checks.reconcile_hit_orphan = (reconBody.results ?? []).some(
    (r) => r.txId === orphanRail && r.outcome === "debited",
  );

  const afterWallet = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}&select=${balCol}`, { headers: hdr })
  ).json();
  const afterTx = await (
    await fetch(`${url}/rest/v1/transactions?id=eq.${tx.id}&select=ledger_debited_at`, { headers: hdr })
  ).json();
  checks.balance_debited = Number(afterWallet[0]?.[balCol]) === beforeBal - amount;
  checks.ledger_debited_at_set = !!afterTx[0]?.ledger_debited_at;

  const out = { at: new Date().toISOString(), orphanRail, reconBody, checks };
  fs.writeFileSync("memory/SMOKE_RECONCILE.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));

  const failed = Object.entries(checks).filter(([, v]) => !v);
  if (failed.length) {
    console.error("reconcile smoke FAILED:", failed.map(([k]) => k).join(", "));
    process.exit(1);
  }
  console.log("reconcile smoke PASS");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
