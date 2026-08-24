/**
 * CI / local smoke gate (no paid deps).
 * Always: webhook unauthenticated → 401
 * Optional (SMOKE_LIVE=1 + .env): Paystack + Stellar scripts
 */
import { spawnSync } from "child_process";
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

const url = env.SUPABASE_URL || process.env.SUPABASE_URL;
if (!url) {
  console.error("Missing SUPABASE_URL");
  process.exit(1);
}

const results = [];

const webhookRes = await fetch(`${url}/functions/v1/webhook-deliver`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    developerId: "00000000-0000-0000-0000-000000000000",
    eventType: "ci.probe",
    payload: { ok: false },
  }),
});
const webhookBody = await webhookRes.text();
results.push({
  name: "webhook_unauth_401",
  pass: webhookRes.status === 401,
  status: webhookRes.status,
  body: webhookBody.slice(0, 120),
});

const reconcileRes = await fetch(`${url}/functions/v1/reconcile-ledger`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ limit: 1 }),
});
const reconcileBody = await reconcileRes.text();
results.push({
  name: "reconcile_unauth_401",
  pass: reconcileRes.status === 401,
  status: reconcileRes.status,
  body: reconcileBody.slice(0, 120),
});

const hasRlsKeys =
  !!(env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  !!(
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY
  );
if (hasRlsKeys) {
  const r = spawnSync(process.execPath, ["scripts/smoke-rls-isolation.mjs"], {
    encoding: "utf8",
    env: process.env,
    timeout: 120_000,
  });
  results.push({
    name: "rls_cross_tenant",
    pass: r.status === 0,
    status: r.status,
    stderr: (r.stderr || "").slice(-400),
    stdout_tail: (r.stdout || "").slice(-600),
  });
}

if (process.env.SMOKE_LIVE === "1") {
  for (const script of ["scripts/smoke-paystack.mjs", "scripts/smoke-stellar.mjs"]) {
    const r = spawnSync(process.execPath, [script], {
      encoding: "utf8",
      env: process.env,
      timeout: 180_000,
    });
    results.push({
      name: script,
      pass: r.status === 0,
      status: r.status,
      stderr: (r.stderr || "").slice(-400),
      stdout_tail: (r.stdout || "").slice(-600),
    });
  }
}

console.log(JSON.stringify({ results }, null, 2));
const failed = results.filter((r) => !r.pass);
if (failed.length) {
  console.error("CI smoke gate FAILED:", failed.map((r) => r.name).join(", "));
  process.exit(1);
}
console.log("CI smoke gate PASS");
