/**
 * Ensure treasury has Circle testnet USDC trustline + print faucet instructions.
 * Issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 (Circle docs)
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

const secret = env.STELLAR_TREASURY_SECRET;
if (!secret) {
  console.error("Missing STELLAR_TREASURY_SECRET");
  process.exit(1);
}

const source = Keypair.fromSecret(secret);
const server = new Horizon.Server(HORIZON);

const main = async () => {
  console.log("treasury", source.publicKey());
  let account = await server.loadAccount(source.publicKey());
  const hasTrust = account.balances.some(
    (b) => b.asset_type !== "native" && b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER,
  );
  if (!hasTrust) {
    console.log("Creating USDC trustline…");
    const fee = await server.fetchBaseFee();
    const tx = new TransactionBuilder(account, {
      fee: String(fee || BASE_FEE),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.changeTrust({ asset: USDC }))
      .setTimeout(180)
      .build();
    tx.sign(source);
    const res = await server.submitTransaction(tx);
    console.log("trustline_tx", res.hash);
    account = await server.loadAccount(source.publicKey());
  } else {
    console.log("trustline already present");
  }

  const usdcBal = account.balances.find(
    (b) => b.asset_type !== "native" && b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER,
  );
  console.log("usdc_balance", usdcBal?.balance ?? "0");
  console.log(
    "faucet",
    "https://faucet.circle.com/ — select Stellar testnet, paste",
    source.publicKey(),
  );
  if (!usdcBal || Number(usdcBal.balance) < 1) {
    console.log(
      "NEED_FAUCET: Request testnet USDC at Circle faucet, then re-run smoke-stellar-usdc.mjs",
    );
    process.exitCode = 2;
  }
};

main().catch((e) => {
  console.error(e.response?.data || e.message || e);
  process.exit(1);
});
