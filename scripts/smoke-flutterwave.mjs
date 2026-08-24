/**
 * Flutterwave failover smoke:
 * 1) Direct FW transfer API with test NGN account
 * 2) /pay bank_transfer with preferRail=flutterwave (test key only)
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
const fwKey = env.FLUTTERWAVE_SECRET_KEY;
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
  // 1) Direct Flutterwave transfer (test account Access Bank 044 / 0690000032)
  const ref = `ps_direct_${Date.now()}_PMCK`;
  const fwRes = await fetch("https://api.flutterwave.com/v3/transfers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${fwKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_bank: "044",
      account_number: "0690000032",
      amount: 100,
      currency: "NGN",
      narration: "Paysmith direct FW smoke",
      reference: ref,
    }),
  });
  const fwText = await fwRes.text();
  log("flutterwave_direct", { status: fwRes.status, body: fwText.slice(0, 500) });

  const devs = await (
    await fetch(
      `${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=id,test_api_key`,
      { headers: hdr },
    )
  ).json();
  const dev = devs[0];
  const wallets = await (
    await fetch(
      `${url}/rest/v1/agent_wallets?owner_id=eq.${dev.id}&status=eq.active&select=id,balance_ngn&limit=5`,
      { headers: hdr },
    )
  ).json();
  let wallet = wallets[0];
  const funded = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}`, {
      method: "PATCH",
      headers: hdr,
      body: JSON.stringify({ balance_ngn: 500, country: "NG", currency: "NGN" }),
    })
  ).json();
  wallet = funded[0];
  log("ledger_funded", { id: wallet.id, balance_ngn: wallet.balance_ngn });

  // amount 100 within tier0 max 200
  const payRes = await fetch(`${url}/functions/v1/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": dev.test_api_key,
      "Idempotency-Key": `fw_smoke_${Date.now()}`,
    },
    body: JSON.stringify({
      walletId: wallet.id,
      to: "0690000032",
      amount: 100,
      currency: "NGN",
      method: "bank_transfer",
      bankCode: "044",
      preferRail: "flutterwave",
      note: "Paysmith FW failover smoke",
    }),
  });
  const payBody = await payRes.text();
  log("pay_response", { status: payRes.status, body: payBody.slice(0, 800) });

  let parsed = {};
  try {
    parsed = JSON.parse(payBody);
  } catch {
    /* ignore */
  }
  const after = await (
    await fetch(`${url}/rest/v1/agent_wallets?id=eq.${wallet.id}&select=balance_ngn`, {
      headers: hdr,
    })
  ).json();
  log("ledger_after", after[0]);

  const fwJson = (() => {
    try {
      return JSON.parse(fwText);
    } catch {
      return {};
    }
  })();
  const ipBlocked =
    typeof fwText === "string" && fwText.toLowerCase().includes("ip whitelist");

  const summary = {
    fw_direct_ok: fwRes.status === 200 && fwText.includes("success"),
    pay_ok: payRes.status === 200,
    provider_flutterwave: parsed.provider === "flutterwave",
    ledger_debited: Number(after[0]?.balance_ngn) === 400,
    ip_whitelist_blocked: ipBlocked,
    failover_path_hit: parsed.provider === "flutterwave",
    verdict:
      payRes.status === 200 && parsed.provider === "flutterwave" && Number(after[0]?.balance_ngn) === 400
        ? "PASS"
        : ipBlocked && parsed.provider === "flutterwave"
          ? "PASS_PATH (enable Flutterwave IP whitelist / allow all for test transfers)"
          : "FAIL",
    fw_message: fwJson.message || null,
  };
  log("summary", summary);
  fs.writeFileSync("memory/SMOKE_FLUTTERWAVE.json", JSON.stringify({ summary, steps }, null, 2));
  if (!String(summary.verdict).startsWith("PASS")) process.exitCode = 1;
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
