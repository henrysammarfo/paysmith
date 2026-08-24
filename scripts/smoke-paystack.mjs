/**
 * Paystack sandbox smoke: fund ledger → POST /pay MoMo → report rail result.
 * Requires .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PAYSTACK_SECRET_KEY
 * and a developer with test_api_key + active agent_wallet.
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
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const hdr = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const email = process.env.SMOKE_DEV_EMAIL || "jasonneil4040@gmail.com";

const steps = [];
const log = (name, data) => {
  steps.push({ name, data, at: new Date().toISOString() });
  console.log(`\n=== ${name} ===`);
  console.log(typeof data === "string" ? data : JSON.stringify(data, null, 2));
};

const main = async () => {
  const balRes = await fetch("https://api.paystack.co/balance", {
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
  });
  const paystackBal = await balRes.json();
  log("paystack_balance", paystackBal);

  const devs = await (
    await fetch(
      `${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=id,test_api_key`,
      { headers: hdr },
    )
  ).json();
  const dev = devs[0];
  if (!dev?.test_api_key) throw new Error(`No developer/test key for ${email}`);

  const wallets = await (
    await fetch(
      `${url}/rest/v1/agent_wallets?owner_id=eq.${dev.id}&status=eq.active&select=id,name,country,currency,balance_ghs,daily_cap,max_per_tx&limit=10`,
      { headers: hdr },
    )
  ).json();
  let wallet = wallets.find((w) => w.country === "GH" || w.currency === "GHS") || wallets[0];
  if (!wallet) throw new Error("No agent wallet");

  const funded = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}`, {
      method: "PATCH",
      headers: hdr,
      body: JSON.stringify({ balance_ghs: 25, country: "GH", currency: "GHS", status: "active" }),
    })
  ).json();
  wallet = funded[0];
  log("ledger_funded", { id: wallet.id, balance_ghs: wallet.balance_ghs });

  const payRes = await fetch(`${url}/functions/v1/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": dev.test_api_key,
    },
    body: JSON.stringify({
      walletId: wallet.id,
      to: "0551234987",
      amount: 1,
      currency: "GHS",
      method: "mobile_money",
      note: "Paysmith Paystack sandbox smoke",
      bankCode: "MTN",
    }),
  });
  const payBody = await payRes.text();
  log("pay_response", { status: payRes.status, body: payBody.slice(0, 1000) });

  const after = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}&select=balance_ghs`, {
      headers: hdr,
    })
  ).json();
  log("ledger_after", after[0]);

  const ghs = paystackBal?.data?.find((b) => b.currency === "GHS")?.balance ?? 0;
  const okAuth = payRes.status !== 401 && payRes.status !== 404;
  const hitPaystack = payBody.includes("paystack") || payBody.includes("insufficient_balance");
  const noDebitOnFail = payRes.status >= 400 && Number(after[0]?.balance_ghs) === 25;

  const summary = {
    auth_and_wallet: okAuth,
    paystack_reached: hitPaystack,
    ledger_not_debited_on_rail_fail: noDebitOnFail,
    paystack_ghs_balance_pesewas: ghs,
    settle_needs_paystack_topup: ghs < 100,
    verdict:
      ghs >= 100 && payRes.status === 200
        ? "PASS full settle"
        : hitPaystack && noDebitOnFail
          ? "PASS path (blocked on Paystack balance top-up)"
          : "FAIL",
  };
  log("summary", summary);
  fs.writeFileSync("memory/SMOKE_PAYSTACK.json", JSON.stringify({ summary, steps }, null, 2));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
