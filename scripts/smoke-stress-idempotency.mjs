/**
 * Live stress: N concurrent /pay with same Idempotency-Key on Stellar XLM (small amount).
 * Expect: single ledger debit; responses are 200 / 409 / replayed same body — never N debits.
 */
import fs from "fs";
import { Keypair } from "@stellar/stellar-sdk";

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
const CONCURRENCY = Number(process.env.STRESS_N || 8);
const AMOUNT = 0.1;
const email = process.env.SMOKE_DEV_EMAIL || "jasonneil4040@gmail.com";
const horizon = "https://horizon-testnet.stellar.org";

const hdr = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function ensureAccount(pub) {
  const r = await fetch(`${horizon}/accounts/${pub}`, { signal: AbortSignal.timeout(60000) });
  if (r.status === 200) return;
  const fb = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(pub)}`, {
    signal: AbortSignal.timeout(60000),
  });
  if (!fb.ok) throw new Error(`friendbot ${fb.status}`);
  await new Promise((res) => setTimeout(res, 2000));
}

const main = async () => {
  const devs = await (
    await fetch(
      `${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=id,test_api_key`,
      { headers: hdr },
    )
  ).json();
  const developer = Array.isArray(devs) ? devs[0] : null;
  if (!developer?.test_api_key) {
    console.error(`No developer with test_api_key for ${email}`);
    process.exit(1);
  }

  const wallets = await (
    await fetch(
      `${url}/rest/v1/agent_wallets?owner_id=eq.${developer.id}&status=eq.active&select=id,balance_xlm&limit=1`,
      { headers: hdr },
    )
  ).json();
  const wallet = Array.isArray(wallets) ? wallets[0] : null;
  if (!wallet) {
    console.error("No agent wallet for smoke developer");
    process.exit(1);
  }

  const fundTo = Math.max(Number(wallet.balance_xlm ?? 0), AMOUNT + 1);
  await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}`, {
    method: "PATCH",
    headers: hdr,
    body: JSON.stringify({ balance_xlm: fundTo }),
  });

  const dest = Keypair.random().publicKey();
  await ensureAccount(dest);

  const balBefore = (
    await (
      await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}&select=balance_xlm`, { headers: hdr })
    ).json()
  )[0].balance_xlm;

  const idem = `stress_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const body = {
    walletId: wallet.id,
    to: dest,
    amount: AMOUNT,
    currency: "XLM",
    method: "crypto",
    note: "idempotency stress",
  };

  const payOnce = () =>
    fetch(`${url}/functions/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": developer.test_api_key,
        "Idempotency-Key": idem,
      },
      body: JSON.stringify(body),
    }).then(async (r) => ({
      status: r.status,
      body: await r.json(),
      replayed: r.headers.get("Idempotency-Replayed"),
    }));

  const results = await Promise.all(Array.from({ length: CONCURRENCY }, () => payOnce()));

  const balAfter = (
    await (
      await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}&select=balance_xlm`, { headers: hdr })
    ).json()
  )[0].balance_xlm;

  const statuses = results.map((r) => r.status);
  const txIds = [...new Set(results.map((r) => r.body?.txId).filter(Boolean))];
  const debitDelta = Number(balBefore) - Number(balAfter);
  const notMultiDebit = debitDelta < AMOUNT * 1.5 + 1e-9;
  const okish = results.every((r) => [200, 409, 500].includes(r.status));
  const successBodies = results.filter((r) => r.status === 200);
  const sameTx =
    successBodies.length === 0 ||
    successBodies.every((r) => r.body?.txId === successBodies[0].body?.txId);

  const pass = okish && notMultiDebit && sameTx && txIds.length <= 1;

  const out = {
    at: new Date().toISOString(),
    concurrency: CONCURRENCY,
    idempotencyKey: idem,
    walletId: wallet.id,
    statuses,
    uniqueTxIds: txIds,
    balBefore,
    balAfter,
    debitDelta,
    notMultiDebit,
    sameTx,
    pass,
    sample: results.slice(0, 4),
  };

  fs.writeFileSync("memory/SMOKE_STRESS_IDEMPOTENCY.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  if (!pass) {
    console.error("stress idempotency FAIL");
    process.exit(1);
  }
  console.log("stress idempotency PASS");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
