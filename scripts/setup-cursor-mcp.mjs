/**
 * Wire Cursor MCP with live test_api_key from DB (writes .cursor/mcp.json — do not commit real keys).
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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SMOKE_DEV_EMAIL || "jasonneil4040@gmail.com";

const devRes = await fetch(
  `${url}/rest/v1/developers?email=eq.${encodeURIComponent(email)}&select=test_api_key`,
  {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  },
);
const devs = await devRes.json();
const apiKey = devs[0]?.test_api_key;
if (!apiKey) {
  console.error("No test_api_key found");
  process.exit(1);
}

const mcp = {
  mcpServers: {
    paysmith: {
      command: "npx",
      args: ["-y", "@paysmithhq/mcp@0.2.2"],
      env: {
        PAYSMITH_API_KEY: apiKey,
        PAYSMITH_BASE_URL: `${url}/functions/v1`,
      },
    },
  },
};

fs.mkdirSync(".cursor", { recursive: true });
fs.writeFileSync(".cursor/mcp.json", JSON.stringify(mcp, null, 2) + "\n");
console.log("Wrote .cursor/mcp.json — restart Cursor MCP");
