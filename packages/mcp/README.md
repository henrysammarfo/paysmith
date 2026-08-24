# @paysmithhq/mcp

MCP server for Cursor / Claude / Codex.

```json
{
  "mcpServers": {
    "paysmith": {
      "command": "npx",
      "args": ["-y", "@paysmithhq/mcp"],
      "env": { "PAYSMITH_API_KEY": "ps_test_…" }
    }
  }
}
```

Tools: `paysmith_create_agent`, `paysmith_list_wallets`, `paysmith_get_balance`, `paysmith_pay`
