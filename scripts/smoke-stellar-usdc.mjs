/**
 * Stellar testnet USDC smoke via /pay.
 * Requires treasury trustline + USDC balance (Circle faucet).
 */
import fs from "fs";
import {
  Asset,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC = new Asset("USDC", USDC_ISSUER);
const HORIZON = "https://horizon-testnet.stellar.org";

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
const log = (n, d) => {
  console.log(`\n=== ${n} ===`);
  console.log(typeof d === "string" ? d : JSON.stringify(d, null, 2));
};

async function ensureTrustline(keypair) {
  const server = new Horizon.Server(HORIZON);
  let account = await server.loadAccount(keypair.publicKey());
  const has = account.balances.some(
    (b) => b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER,
  );
  if (has) return;
  const fee = await server.fetchBaseFee();
  const tx = new TransactionBuilder(account, {
    fee: String(fee || BASE_FEE),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset: USDC }))
    .setTimeout(180)
    .build();
  tx.sign(keypair);
  await server.submitTransaction(tx);
}

const main = async () => {
  const server = new Horizon.Server(HORIZON);
  const treasury = Keypair.fromSecret(env.STELLAR_TREASURY_SECRET);
  await ensureTrustline(treasury);
  const tAcc = await server.loadAccount(treasury.publicKey());
  const tUsdc = tAcc.balances.find((b) => b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER);
  log("treasury_usdc", tUsdc?.balance ?? "0");
  if (!tUsdc || Number(tUsdc.balance) < 1) {
    log("NEED_FAUCET", {
      address: treasury.publicKey(),
      url: "https://faucet.circle.com/",
      hint: "Select Stellar, request USDC, re-run this script",
    });
    process.exit(2);
  }

  const dest = Keypair.random();
  await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(dest.publicKey())}`);
  await new Promise((r) => setTimeout(r, 2500));
  await ensureTrustline(dest);
  log("destination", dest.publicKey());

  const devs = await (
    await fetch(
      `${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=id,test_api_key`,
      { headers: hdr },
    )
  ).json();
  const wallets = await (
    await fetch(
      `${url}/rest/v1/agent_wallets?owner_id=eq.${devs[0].id}&status=eq.active&select=id,balance_usd&limit=3`,
      { headers: hdr },
    )
  ).json();
  let wallet = wallets[0];
  wallet = (
    await (
      await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}`, {
        method: "PATCH",
        headers: hdr,
        body: JSON.stringify({ balance_usd: 10 }),
      })
    ).json()
  )[0];
  log("ledger_funded", { id: wallet.id, balance_usd: wallet.balance_usd });

  // tier0 max 200 — amount 1 USDC OK
  const payRes = await fetch(`${url}/functions/v1/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": devs[0].test_api_key,
      "Idempotency-Key": `usdc_smoke_${Date.now()}`,
    },
    body: JSON.stringify({
      walletId: wallet.id,
      to: dest.publicKey(),
      amount: 1,
      currency: "USDC",
      method: "crypto",
      note: "Paysmith USDC smoke",
    }),
  });
  const payBody = await payRes.text();
  log("pay_response", { status: payRes.status, body: payBody.slice(0, 900) });
  let parsed = {};
  try {
    parsed = JSON.parse(payBody);
  } catch {
    /* ignore */
  }
  const hash = parsed.stellarTxHash || parsed.txId;
  if (hash && /^[a-f0-9]{64}$/i.test(hash)) {
    log("explorer", `https://stellar.expert/explorer/testnet/tx/${hash}`);
  }
  const after = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}&select=balance_usd`, {
      headers: hdr,
    })
  ).json();
  log("ledger_after", after[0]);

  const summary = {
    http_ok: payRes.status === 200,
    provider_stellar: parsed.provider === "stellar",
    settled: parsed.status === "settled",
    hash: hash || null,
    ledger_debited: Number(after[0]?.balance_usd) === 9,
    verdict:
      payRes.status === 200 &&
      parsed.provider === "stellar" &&
      Number(after[0]?.balance_usd) === 9
        ? "PASS"
        : "FAIL",
  };
  log("summary", summary);
  fs.writeFileSync("memory/SMOKE_STELLAR_USDC.json", JSON.stringify({ summary }, null, 2));
  if (summary.verdict !== "PASS") process.exitCode = 1;
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
