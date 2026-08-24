# AGENTS.md — Paysmith

For Cursor, Claude Code, Codex, and other coding agents.

## Product

Paysmith = policy-bound agent wallets for Africa MoMo/bank sandboxes + Stellar testnet. Not a licensed VASP; not mainnet-live by default.

## Packages

- `@paysmithhq/sdk` — TypeScript client (`Paysmith`, `newIdempotencyKey`)
- `@paysmithhq/cli` — `paysmith` CLI
- `@paysmithhq/mcp` — MCP tools

## API (only these)

1. `POST /agents-create`
2. `GET /agents-balance` (`?walletId=` optional)
3. `POST /pay` — always send `Idempotency-Key`
4. `GET /partna-quote` — optional; may 501

Auth: `x-api-key`.

## Rules

- Prefer SDK over raw curl in app code.
- Never commit API keys.
- Never claim unhackable or pen-test complete.
- Update `memory/CURRENT_STATE.md` + `memory/SESSION_LOG.md` when product behavior changes.
- Skill: `.cursor/skills/paysmith-agent-payments`

## Monorepo

```
packages/sdk   packages/cli   packages/mcp
integrations/cursor|claude|codex
```
