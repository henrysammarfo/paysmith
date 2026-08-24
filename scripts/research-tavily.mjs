/**
 * Live research via Tavily (when TAVILY_API_KEY set) + structured output for memory updates.
 * Usage: node scripts/research-tavily.mjs [query...]
 * Default queries: SCF #46 deadline, Partna Stellar network, MoneyGram Ramps Stellar
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

const apiKey = env.TAVILY_API_KEY || process.env.TAVILY_API_KEY;
const defaultQueries = [
  "Stellar Community Fund Build round 46 submission deadline November 2026",
  "Partna API supported blockchain networks USDC Stellar",
  "MoneyGram Ramps Stellar SEP-24 partner portal sandbox register",
];

const queries = process.argv.slice(2).length ? process.argv.slice(2) : defaultQueries;

async function tavilySearch(query) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 8,
      include_answer: true,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(body)}`);
  return { query, answer: body.answer, results: (body.results || []).slice(0, 5) };
}

const main = async () => {
  const out = { at: new Date().toISOString(), source: apiKey ? "tavily" : "skipped", queries: [] };

  if (!apiKey) {
    console.error("TAVILY_API_KEY missing — add to .env or run with env var.");
    console.error("Fallback: use WebFetch on primary docs (see memory/FACT_CHECK.md).");
    process.exit(1);
  }

  for (const q of queries) {
    out.queries.push(await tavilySearch(q));
  }

  fs.writeFileSync("memory/TAVILY_RESEARCH.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
