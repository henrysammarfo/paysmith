/**
 * Agent ↔ Paysmith ↔ Stellar smoke (Demo Day / Instaward evidence).
 * Loads developer test key from DB, creates agent, pays XLM if treasury set.
 */
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

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

const email = process.env.SMOKE_DEV_EMAIL || "jasonneil4040@gmail.com";
const base = (env.SUPABASE_URL || env.VITE_SUPABASE_URL).replace(/\/$/, "");
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: dev, error } = await sb
  .from("developers")
  .select("id, test_api_key, email")
  .eq("email", email)
  .maybeSingle();

if (error || !dev?.test_api_key) {
  console.error("No developer/test_api_key for", email, error);
  process.exit(1);
}

const apiKey = dev.test_api_key;
const headers = {
  "Content-Type": "application/json",
  "x-api-key": apiKey,
};

const createRes = await fetch(`${base}/functions/v1/agents-create`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: `stellar14-agent-${Date.now().toString(36)}`,
    country: "GH",
    currency: "GHS",
    spendingPolicy: { dailyLimit: 500, maxSingleTx: 100 },
  }),
});
const created = await createRes.json();
if (!createRes.ok) {
  console.error("agents-create failed", createRes.status, created);
  process.exit(1);
}

const walletId = created.walletId || created.id || created.wallet?.id;
const balRes = await fetch(
  `${base}/functions/v1/agents-balance?walletId=${walletId}`,
  { headers },
);
const balance = await balRes.json();

const out = {
  at: new Date().toISOString(),
  ok: createRes.ok && balRes.ok,
  walletId,
  create: created,
  balance,
  stellar: {
    policyContract:
      env.STELLAR_SOROBAN_POLICY_CONTRACT_ID ||
      "CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW",
    freighterDemo: "https://paysmith-eight.vercel.app/stellar",
    lab: `https://lab.stellar.org/smart-contracts/contract-explorer?network=testnet&contractId=${env.STELLAR_SOROBAN_POLICY_CONTRACT_ID || "CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW"}`,
  },
  note: "Pay XLM/USDC via smoke:stellar / smoke:stellar-usdc when treasury funded",
};

fs.writeFileSync("memory/SMOKE_AGENT_STELLAR_E2E.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
if (!out.ok) process.exit(1);
