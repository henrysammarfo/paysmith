# SCF demo thread (draft — post when ready)

**Rule:** Only post after verifying claims in `memory/FACT_CHECK.md`. Replace placeholders with live counts.

---

**Tweet 1**  
We built Paysmith — Stripe-style API for **AI agent wallets** in Africa.  
Real sandbox settles today:  
• Paystack MoMo (GH)  
• Flutterwave bank (NG)  
• Stellar USDC + XLM (testnet)  
Not a mock SDK. Real Edge `fetch`. Thread 🧵

**Tweet 2**  
Install the SDK:

```bash
npm i @paysmithhq/sdk
npx paysmith wallets
```

Create an agent wallet:

```bash
curl -X POST $PAYSMITH/agents-create \
  -H "x-api-key: ps_test_..." \
  -d '{"name":"Proc Agent","country":"GH","currency":"GHS"}'
```

**Tweet 3**  
Pay MoMo (Paystack sandbox):

```bash
curl -X POST $PAYSMITH/pay \
  -H "X-API-KEY: ..." \
  -H "Idempotency-Key: demo-1" \
  -d '{"walletId":"...","to":"055...","amount":1,"currency":"GHS","method":"mobile_money","bankCode":"MTN"}'
```

Ledger debits. Idempotency replays — including debit-fail 500 (no double rail).

**Tweet 4**  
Stellar USDC on testnet — hash on stellar.expert, treasury Circle testnet issuer.  
Same `/pay` endpoint, `method: crypto`, `currency: USDC`.

**Tweet 5**  
Security gates we actually run locally (no GitHub Actions):  
✅ RLS cross-tenant blocked  
✅ Webhook + reconcile 401 without secret  
✅ Admin role audit log  
✅ Orphan ledger reconcile every 15m (pg_cron)

**Tweet 6**  
Ghana → Nigeria → Kenya corridors. Agent spending caps + KYC tiers.  
Building on Stellar for USDC settlement; MoMo via licensed PSPs — not EMI float.

**Tweet 7**  
Waitlist for AI builders + fintech teams in GH/NG/KE: [landing URL]  
Open source: [GitHub URL]  
Stellar Ghana — Instaward sprint scope in repo `memory/INSTAWARD_SPRINT.md`.

---

**Discord (Stellar #payments)** — shorter version of tweets 1 + 4 + 5 with explorer link.

**Do not claim:** production live corridors, Partna integrated, Soroban on mainnet, pen-test complete.

**Replace before posting:** `[landing URL]` → your deployed site · `[GitHub URL]` → public repo if applicable.
