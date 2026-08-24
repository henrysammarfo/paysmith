/**
 * Smoke: user_roles mutation writes admin_audit_log.
 * Creates ephemeral auth user, grants admin, asserts audit row, cleans up.
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

const stamp = Date.now();
const email = `audit-${stamp}@paysmith-test.local`;
const password = `Audit_${stamp}_Aa1!`;
let userId = null;

const cleanup = async () => {
  if (userId) {
    await fetch(`${url}/auth/v1/admin/users/${userId}`, { method: "DELETE", headers: hdr });
  }
};

const main = async () => {
  try {
    const created = await (
      await fetch(`${url}/auth/v1/admin/users`, {
        method: "POST",
        headers: hdr,
        body: JSON.stringify({ email, password, email_confirm: true }),
      })
    ).json();
    userId = created.id;
    if (!userId) throw new Error(`create user failed: ${JSON.stringify(created)}`);

    // Wait for handle_new_user → user_roles 'user'
    for (let i = 0; i < 20; i++) {
      const roles = await (
        await fetch(`${url}/rest/v1/user_roles?user_id=eq.${userId}&select=id,role`, { headers: hdr })
      ).json();
      if (roles?.length) break;
      await new Promise((r) => setTimeout(r, 200));
    }

    const inserted = await (
      await fetch(`${url}/rest/v1/user_roles`, {
        method: "POST",
        headers: hdr,
        body: JSON.stringify({ user_id: userId, role: "admin" }),
      })
    ).json();
    if (!inserted[0]?.id) throw new Error(`admin insert failed: ${JSON.stringify(inserted)}`);

    await new Promise((r) => setTimeout(r, 300));

    const logs = await (
      await fetch(
        `${url}/rest/v1/admin_audit_log?target_user_id=eq.${userId}&order=created_at.desc&select=action,new_role,old_role,target_user_id`,
        { headers: hdr },
      )
    ).json();

    const checks = {
      log_exists: Array.isArray(logs) && logs.length > 0,
      admin_insert_logged: logs.some((l) => l.action === "insert" && l.new_role === "admin"),
      user_insert_logged: logs.some((l) => l.action === "insert" && l.new_role === "user"),
    };

    const out = { at: new Date().toISOString(), userId, logs, checks };
    fs.writeFileSync("memory/SMOKE_ADMIN_AUDIT.json", JSON.stringify(out, null, 2));
    console.log(JSON.stringify(out, null, 2));

    if (!checks.log_exists || !checks.admin_insert_logged) {
      console.error("admin audit smoke FAILED");
      process.exit(1);
    }
    console.log("admin audit smoke PASS");
  } finally {
    await cleanup();
  }
};

main().catch(async (e) => {
  console.error(e);
  await cleanup();
  process.exit(1);
});
