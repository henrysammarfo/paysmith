/**
 * Smoke Daraja OAuth (+ B2C if DARAJA_SECURITY_CREDENTIAL set).
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

const key = env.DARAJA_CONSUMER_KEY;
const secret = env.DARAJA_CONSUMER_SECRET;
if (!key || !secret) {
  console.error("Missing DARAJA_CONSUMER_KEY / DARAJA_CONSUMER_SECRET");
  process.exit(1);
}

const basic = Buffer.from(`${key}:${secret}`).toString("base64");
const tokRes = await fetch(
  "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
  { headers: { Authorization: `Basic ${basic}` } },
);
const tokBody = await tokRes.json();
console.log(
  JSON.stringify(
    {
      oauth_ok: tokRes.ok,
      expires_in: tokBody.expires_in,
      has_token: Boolean(tokBody.access_token),
    },
    null,
    2,
  ),
);
if (!tokRes.ok || !tokBody.access_token) process.exit(1);

const out = {
  at: new Date().toISOString(),
  oauth: true,
  b2c: null,
};

if (env.DARAJA_SECURITY_CREDENTIAL) {
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
    body: JSON.stringify({ balance_kes: 500 }),
  });
  const payRes = await fetch(`${url}/functions/v1/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": devs[0].test_api_key,
    },
    body: JSON.stringify({
      walletId: wallets[0].id,
      to: "254708374149",
      amount: 10,
      currency: "KES",
      method: "mobile_money",
      bankCode: "MPESA",
      preferRail: "daraja",
      note: "daraja smoke",
    }),
  });
  const payBody = await payRes.text();
  out.b2c = { status: payRes.status, body: payBody.slice(0, 800) };
  console.log(JSON.stringify(out.b2c, null, 2));
} else {
  console.log(
    "B2C skipped — paste DARAJA_SECURITY_CREDENTIAL from Daraja Test Credentials, then re-run.",
  );
}

fs.writeFileSync("memory/SMOKE_DARAJA.json", JSON.stringify(out, null, 2));
console.log(out.oauth ? "PASS oauth" : "FAIL");
process.exit(out.oauth ? 0 : 1);
