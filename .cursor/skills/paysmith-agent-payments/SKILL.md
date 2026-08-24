---
name: paysmith-agent-payments
description: >-
  Build and operate Paysmith agent wallets (create, balance, pay) via SDK, CLI,
  or MCP. Use for MoMo/bank/Stellar sandbox payments, idempotency, spending
  policies, or wiring Cursor/Claude/Codex agents to Paysmith.
---

# Paysmith agent payments

## Stack

| Piece | Package |
|-------|---------|
| SDK | `@paysmithhq/sdk` |
| CLI | `@paysmithhq/cli` (`paysmith`) |
| MCP | `@paysmithhq/mcp` (`paysmith-mcp`) |

Auth header: `x-api-key`. Pay header: `Idempotency-Key` (always).

## Edge map

| SDK | Path |
|-----|------|
| `createAgent` | `POST /agents-create` |
| `getBalance` / `listWallets` | `GET /agents-balance` |
| `pay` | `POST /pay` |
| `quotePartna` | `GET /partna-quote` (may 501) |

Methods: `mobile_money` \| `bank_transfer` \| `crypto` \| `card`.

## Rules

- Prefer SDK over inventing REST paths.
- Always set idempotency on `pay` (`newIdempotencyKey()`).
- Sandbox / Stellar testnet by default — do not claim live mainnet corridors.
- Never call webhook deliver from client code.
- Never claim unhackable / pen-test complete.

## SDK

```ts
import { Paysmith, newIdempotencyKey } from "@paysmithhq/sdk";

const ps = new Paysmith({ apiKey: process.env.PAYSMITH_API_KEY! });
const { walletId } = await ps.createAgent({
  name: "bot",
  country: "GH",
  currency: "GHS",
  paymentMethods: ["mobile_money"],
  spendingPolicy: { dailyLimit: 10_000, maxSingleTx: 2_000 },
});
await ps.pay(
  {
    walletId,
    to: "0551234987",
    amount: 1,
    currency: "GHS",
    method: "mobile_money",
    bankCode: "MTN",
  },
  { idempotencyKey: newIdempotencyKey("order") },
);
```

## MCP tools

`paysmith_create_agent` · `paysmith_list_wallets` · `paysmith_get_balance` · `paysmith_pay`

Configs: `integrations/cursor/mcp.json`, `integrations/claude/`, `integrations/codex/`.
