# @paysmithhq/sdk

Official TypeScript client for Paysmith — policy-bound agent wallets, MoMo/bank sandboxes, Stellar testnet.

```bash
npm install @paysmithhq/sdk
```

```ts
import { Paysmith, newIdempotencyKey } from "@paysmithhq/sdk";

const ps = new Paysmith({ apiKey: process.env.PAYSMITH_API_KEY! });

const agent = await ps.createAgent({
  name: "procurement-bot",
  country: "GH",
  currency: "GHS",
  paymentMethods: ["mobile_money"],
  spendingPolicy: { dailyLimit: 10_000, maxSingleTx: 2_000 },
});

await ps.pay(
  {
    walletId: agent.walletId,
    to: "0551234987",
    amount: 1,
    currency: "GHS",
    method: "mobile_money",
    bankCode: "MTN",
  },
  { idempotencyKey: newIdempotencyKey("order") },
);

await ps.getBalance(agent.walletId);
await ps.listWallets();
```

| Method | Edge |
|--------|------|
| `createAgent` | `POST /agents-create` |
| `getBalance` | `GET /agents-balance?walletId=` |
| `listWallets` | `GET /agents-balance` |
| `pay` | `POST /pay` + `Idempotency-Key` |
| `quotePartna` | `GET /partna-quote` (may 501) |

Also: `@paysmithhq/cli`, `@paysmithhq/mcp`, skill `.cursor/skills/paysmith-agent-payments`.
