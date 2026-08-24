/**
 * Smoke MTN MoMo Disbursement via /pay (preferRail: mtn).
 */
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SMOKE_DEV_EMAIL || "jasonneil4040@gmail.com";
const hdr = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const devs = await (
  await fetch(
    `${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=id,test_api_key`,
    { headers: hdr },
  )
).json();
const wallets = await (
  await fetch(
    `${url}/rest/v1/agent_wallets?owner_id=eq.${devs[0].id}&status=eq.active&select=id&limit=1`,
    { headers: hdr },
  )
).json();
await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallets[0].id}`, {
  method: "PATCH",
  headers: hdr,
  body: JSON.stringify({ balance_ghs: 100 }),
});

const payRes = await fetch(`${url}/functions/v1/pay`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": devs[0].test_api_key,
    "Idempotency-Key": `mtn_smoke_${Date.now()}`,
  },
  body: JSON.stringify({
    walletId: wallets[0].id,
    to: "46733123450",
    amount: 1,
    currency: "GHS",
    method: "mobile_money",
    preferRail: "mtn",
    note: "mtn momo smoke",
  }),
});
const payBody = await payRes.text();
const out = {
  at: new Date().toISOString(),
  status: payRes.status,
  body: (() => {
    try {
      return JSON.parse(payBody);
    } catch {
      return payBody.slice(0, 800);
    }
  })(),
};
console.log(JSON.stringify(out, null, 2));
fs.writeFileSync("memory/SMOKE_MTN.json", JSON.stringify(out, null, 2));
const ok =
  payRes.status === 200 &&
  (out.body?.provider === "mtn_momo" ||
    out.body?.status === "pending" ||
    out.body?.status === "settled");
console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
