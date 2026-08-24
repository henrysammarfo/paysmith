/**
 * Smoke: POST /agents-create → verify live schema columns → cleanup.
 * Requires .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import fs from "fs";

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
  const devs = await (
    await fetch(`${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=id,test_api_key`, {
      headers: hdr,
    })
  ).json();
  const dev = devs[0];
  if (!dev?.test_api_key) throw new Error(`No developer/test key for ${email}`);

  const createRes = await fetch(`${url}/functions/v1/agents-create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": dev.test_api_key,
    },
    body: JSON.stringify({
      name: "Schema Align Probe",
      country: "GH",
      currency: "GHS",
      paymentMethods: ["mobile_money"],
      spendingPolicy: { dailyLimit: 1234, maxSingleTx: 56 },
    }),
  });
  const created = await createRes.json();
  if (!createRes.ok) throw new Error(`agents-create ${createRes.status}: ${JSON.stringify(created)}`);

  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const checks = {
    status_201: createRes.status === 201,
    wallet_uuid: uuidRe.test(created.walletId),
    no_api_key: created.apiKey === undefined,
    spending_policy: created.spendingPolicy?.dailyLimit === 1234 && created.spendingPolicy?.maxSingleTx === 56,
  };

  const row = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${created.walletId}&select=daily_cap,max_per_tx,email`, {
      headers: hdr,
    })
  ).json();
  checks.db_daily_cap = Number(row[0]?.daily_cap) === 1234;
  checks.db_max_per_tx = Number(row[0]?.max_per_tx) === 56;
  checks.db_email = typeof row[0]?.email === "string" && row[0].email.includes("@paysmith.ai");
  const methodsRow = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${created.walletId}&select=payment_methods`, {
      headers: hdr,
    })
  ).json();
  checks.db_payment_methods =
    Array.isArray(methodsRow[0]?.payment_methods) &&
    methodsRow[0].payment_methods.includes("mobile_money");
  checks.response_payment_methods =
    Array.isArray(created.paymentMethods) && created.paymentMethods.includes("mobile_money");

  const balRes = await fetch(`${url}/functions/v1/agents-balance?walletId=${created.walletId}`, {
    headers: { "x-api-key": dev.test_api_key },
  });
  const bal = await balRes.json();
  checks.balance_ok =
    balRes.ok &&
    bal.walletId === created.walletId &&
    bal.spendingPolicy?.dailyLimit === 1234 &&
    typeof bal.balances?.ghs === "number";

  await fetch(`${url}/rest/v1/agent_wallets?id=eq.${created.walletId}`, { method: "DELETE", headers: hdr });

  const out = { at: new Date().toISOString(), created, checks };
  fs.writeFileSync("memory/SMOKE_AGENTS_CREATE.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));

  const failed = Object.entries(checks).filter(([, v]) => !v);
  if (failed.length) {
    console.error("agents-create smoke FAILED:", failed.map(([k]) => k).join(", "));
    process.exit(1);
  }
  console.log("agents-create smoke PASS");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
