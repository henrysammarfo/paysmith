# Paysmith + Cursor

Copy `.cursor/mcp.json` is wired for this repo. Replace `REPLACE_WITH_ps_test_FROM_DASHBOARD` with your sandbox key from **Dashboard → API Keys** (or run `node scripts/smoke-npm-packages.mjs` — key comes from DB, not printed).

Restart Cursor after editing MCP config.

Tools: `paysmith_create_agent`, `paysmith_list_wallets`, `paysmith_get_balance`, `paysmith_pay`

Also see `integrations/cursor/mcp.json` for the template committed to git (no real keys).
