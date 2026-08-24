/**
 * One-time: Vault secrets for pg_cron → reconcile-ledger.
 * Docs: https://supabase.com/docs/guides/functions/schedule-functions
 * Never prints secret values.
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

const projectUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const internal = env.WEBHOOK_INTERNAL_SECRET;

if (!projectUrl || !internal) {
  console.error("Need SUPABASE_URL and WEBHOOK_INTERNAL_SECRET in .env");
  process.exit(1);
}

const q = (s) => s.replace(/'/g, "''");
const tmp = ".tmp-setup-reconcile-cron.sql";
fs.writeFileSync(
  tmp,
  `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'paysmith_project_url') THEN
    PERFORM vault.create_secret('${q(projectUrl)}', 'paysmith_project_url');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'paysmith_internal_secret') THEN
    PERFORM vault.create_secret('${q(internal)}', 'paysmith_internal_secret');
  END IF;
END $$;
SELECT name FROM vault.secrets WHERE name LIKE 'paysmith_%' ORDER BY 1;
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'paysmith-reconcile-ledger';
`,
);

const r = spawnSync("npx", ["supabase", "db", "query", "--linked", "-f", tmp, "-o", "json"], {
  encoding: "utf8",
  shell: true,
});

try {
  fs.unlinkSync(tmp);
} catch {
  /* ignore */
}

console.log(r.stdout || "");
if (r.stderr) console.error(r.stderr.slice(0, 2000));
if (r.status !== 0) {
  // Fallback: pipe stdin
  const r2 = spawnSync("npx", ["supabase", "db", "query", "--linked", "-o", "json"], {
    encoding: "utf8",
    shell: true,
    input: fs.existsSync(tmp)
      ? undefined
      : `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'paysmith_project_url') THEN
    PERFORM vault.create_secret('${q(projectUrl)}', 'paysmith_project_url');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'paysmith_internal_secret') THEN
    PERFORM vault.create_secret('${q(internal)}', 'paysmith_internal_secret');
  END IF;
END $$;
SELECT name FROM vault.secrets WHERE name LIKE 'paysmith_%' ORDER BY 1;
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'paysmith-reconcile-ledger';
`,
  });
  console.log(r2.stdout || "");
  if (r2.stderr) console.error(r2.stderr.slice(0, 2000));
  if (r2.status !== 0) process.exit(r2.status ?? 1);
}
console.log("Vault paysmith_* secrets present (values not printed).");
