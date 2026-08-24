# Codex — Paysmith

## MCP (`~/.codex/config.toml`)

```toml
[mcp_servers.paysmith]
command = "npx"
args = ["-y", "@paysmithhq/mcp"]

[mcp_servers.paysmith.env]
PAYSMITH_API_KEY = "ps_test_…"
```

## Instructions

Repo `AGENTS.md` + skill `.cursor/skills/paysmith-agent-payments/SKILL.md`.

## CLI fallback

```bash
npx @paysmithhq/cli --help
```
