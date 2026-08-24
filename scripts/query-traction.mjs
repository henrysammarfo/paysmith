/**
 * Query live traction counts for memory/TRACTION.md (honest DB numbers).
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
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const hdr = { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" };

async function count(table, filter = "") {
  const res = await fetch(`${url}/rest/v1/${table}?select=id${filter}`, {
    headers: { ...hdr, Range: "0-0" },
  });
  const range = res.headers.get("content-range") || "0-0/0";
  return Number(range.split("/")[1] || 0);
}

const waitlist = await count("waitlist_signups");
const wallets = await count("agent_wallets");
const txs = await count("transactions");
const stellar = await count("transactions", "&stellar_tx_hash=not.is.null");

const out = {
  at: new Date().toISOString(),
  waitlist_signups: waitlist,
  agent_wallets: wallets,
  transactions: txs,
  stellar_settles: stellar,
};

console.log(JSON.stringify(out, null, 2));
fs.writeFileSync("memory/TRACTION_LIVE.json", JSON.stringify(out, null, 2));
