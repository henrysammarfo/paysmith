#!/usr/bin/env node
/**
 * Generate a Stellar testnet treasury keypair and fund via Friendbot.
 * Usage: node scripts/generate-stellar-testnet.mjs
 * Paste STELLAR_TREASURY_* into Supabase secrets / chat (secret = keep private).
 */
import { Keypair } from "@stellar/stellar-sdk";

const pair = Keypair.random();
const publicKey = pair.publicKey();
const secret = pair.secret();

console.log("\n=== Paysmith Stellar TESTNET treasury ===\n");
console.log(`STELLAR_NETWORK=testnet`);
console.log(`STELLAR_TREASURY_PUBLIC=${publicKey}`);
console.log(`STELLAR_TREASURY_SECRET=${secret}`);
console.log("\nFunding via Friendbot...");

const res = await fetch(
  `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
);
const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error("Friendbot failed:", res.status, body);
  process.exit(1);
}
console.log("Funded with testnet XLM. Explorer:");
console.log(`https://stellar.expert/explorer/testnet/account/${publicKey}`);
console.log("\n⚠️  Never commit the SECRET. Add it only to Supabase Edge Function secrets.\n");
