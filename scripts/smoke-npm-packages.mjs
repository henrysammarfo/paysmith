/**
 * Smoke published npm packages (@paysmithhq/sdk + cli) with live test_api_key from DB.
 */
import fs from "fs";
import { execSync } from "child_process";
import { Paysmith } from "@paysmithhq/sdk";

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

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const hdr = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
};

const devRes = await fetch(
  `${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=test_api_key`,
  { headers: hdr },
);
const devs = await devRes.json();
const apiKey = devs[0]?.test_api_key;
if (!apiKey) {
  console.error("No test_api_key for developer", email);
  process.exit(1);
}

const baseUrl = `${url}/functions/v1`;
const ps = new Paysmith({ apiKey, baseUrl });

console.log("SDK smoke: listWallets…");
const list = await ps.listWallets();
console.log(JSON.stringify({ ok: true, count: list.count, sdk: "0.2.0" }, null, 2));

console.log("CLI smoke: paysmith wallets…");
const out = execSync("npx paysmith wallets", {
  env: { ...process.env, PAYSMITH_API_KEY: apiKey, PAYSMITH_BASE_URL: baseUrl },
  encoding: "utf8",
});
const parsed = JSON.parse(out);
console.log(JSON.stringify({ ok: true, cli: "0.2.2", count: parsed.count }, null, 2));

fs.writeFileSync(
  "memory/SMOKE_NPM_PACKAGES.json",
  JSON.stringify(
    {
      at: new Date().toISOString(),
      sdk: "0.2.0",
      cli: "0.2.2",
      walletCount: list.count,
      pass: true,
    },
    null,
    2,
  ),
);

console.log("PASS — npm packages smoke OK");
