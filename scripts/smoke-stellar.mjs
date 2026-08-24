/**
 * Stellar testnet smoke: fund ledger XLM → POST /pay crypto → explorer hash.
 * Requires .env: SUPABASE_*, STELLAR_TREASURY_* (treasury must be Friendbot-funded).
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
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const hdr = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};
const email = process.env.SMOKE_DEV_EMAIL || "jasonneil4040@gmail.com";
const horizon = "https://horizon-testnet.stellar.org";
const steps = [];
const log = (name, data) => {
  steps.push({ name, data, at: new Date().toISOString() });
  console.log(`\n=== ${name} ===`);
  console.log(typeof data === "string" ? data : JSON.stringify(data, null, 2));
};

async function ensureAccount(pub) {
  const r = await fetch(`${horizon}/accounts/${pub}`, { signal: AbortSignal.timeout(60000) });
  if (r.status === 200) return await r.json();
  const fb = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(pub)}`, {
    signal: AbortSignal.timeout(60000),
  });
  const body = await fb.text();
  if (!fb.ok) throw new Error(`friendbot ${fb.status}: ${body.slice(0, 200)}`);
  await new Promise((res) => setTimeout(res, 2000));
  const r2 = await fetch(`${horizon}/accounts/${pub}`, { signal: AbortSignal.timeout(60000) });
  if (!r2.ok) throw new Error(`account still missing after friendbot`);
  return await r2.json();
}

const main = async () => {
  const treasuryPub = env.STELLAR_TREASURY_PUBLIC;
  const treasury = await ensureAccount(treasuryPub);
  log(
    "treasury",
    (treasury.balances || []).map((b) => `${b.asset_type}:${b.balance}`),
  );

  // Fresh destination so we know the payment is ours
  const dest = Keypair.random();
  await ensureAccount(dest.publicKey());
  log("destination", { public: dest.publicKey() });

  const devs = await (
    await fetch(
      `${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=id,test_api_key`,
      { headers: hdr },
    )
  ).json();
  const dev = devs[0];
  if (!dev?.test_api_key) throw new Error(`No developer for ${email}`);

  const wallets = await (
    await fetch(
      `${url}/rest/v1/agent_wallets?owner_id=eq.${dev.id}&status=eq.active&select=id,balance_xlm&limit=5`,
      { headers: hdr },
    )
  ).json();
  let wallet = wallets[0];
  if (!wallet) throw new Error("No agent wallet");

  const funded = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}`, {
      method: "PATCH",
      headers: hdr,
      body: JSON.stringify({ balance_xlm: 10 }),
    })
  ).json();
  wallet = funded[0];
  log("ledger_funded", { id: wallet.id, balance_xlm: wallet.balance_xlm });

  const payRes = await fetch(`${url}/functions/v1/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": dev.test_api_key,
    },
    body: JSON.stringify({
      walletId: wallet.id,
      to: dest.publicKey(),
      amount: 0.5,
      currency: "XLM",
      method: "crypto",
      note: "Paysmith stellar smoke",
    }),
  });
  const payBody = await payRes.text();
  log("pay_response", { status: payRes.status, body: payBody.slice(0, 1200) });

  let parsed = {};
  try {
    parsed = JSON.parse(payBody);
  } catch {
    /* ignore */
  }
  const hash = parsed.stellarTxHash || parsed.txId;
  if (hash && /^[a-f0-9]{64}$/i.test(hash)) {
    log("explorer", `https://stellar.expert/explorer/testnet/tx/${hash}`);
    const tx = await fetch(`${horizon}/transactions/${hash}`, {
      signal: AbortSignal.timeout(60000),
    });
    log("horizon_tx", { status: tx.status, ok: tx.ok });
  }

  const after = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}&select=balance_xlm`, {
      headers: hdr,
    })
  ).json();
  log("ledger_after", after[0]);

  const summary = {
    http_ok: payRes.status === 200,
    provider_stellar: parsed.provider === "stellar",
    status_settled: parsed.status === "settled",
    hash: hash || null,
    ledger_debited: Number(after[0]?.balance_xlm) === 9.5,
    verdict:
      payRes.status === 200 &&
      parsed.provider === "stellar" &&
      Number(after[0]?.balance_xlm) === 9.5
        ? "PASS"
        : "FAIL",
  };
  log("summary", summary);
  fs.writeFileSync("memory/SMOKE_STELLAR.json", JSON.stringify({ summary, steps }, null, 2));
  if (summary.verdict !== "PASS") process.exitCode = 1;
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
