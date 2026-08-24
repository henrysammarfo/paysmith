# MoneyGram Ramps — P8 apply pack (fact-checked)

**Verified:** 2026-08-23 from [developer.moneygram.com](https://developer.moneygram.com/moneygram-developer/docs/integrate-moneygram-ramps), [d5xramps.moneygram.com](https://d5xramps.moneygram.com/), [stellar.org case study](https://stellar.org/case-studies/moneygram-international)

## What it is

USDC cash-in / cash-out at MoneyGram locations. **Stellar path:** SEP-10 + **SEP-24** (not Paysmith’s current Horizon-only treasury send).

## Apply (sandbox)

1. Register: [Partner Portal](https://xramps.moneygram.com/ops/partner/register)
2. Request sandbox; domain allowlist + API keys
3. Developer docs: [xramps.moneygram.com/ops/developer](https://xramps.moneygram.com/ops/developer)
4. Stellar integration guide: [stellar.org docs — MoneyGram access](https://developers.stellar.org/docs/building-apps/moneygram-access-integration-guide)

## Paysmith fit (Integration track)

Compose **MoneyGram Ramps (SEP-24)** + **Paystack MoMo last-mile** + agent wallet API. Not a replacement for `/pay` Paystack path today.

## Blockers before code

- [ ] Partner portal approval
- [ ] SEP-24 anchor flow (different from treasury Horizon payment in `/pay`)
- [ ] KYB + wallet registration process per MGI case study
- [ ] SCF traction evidence (testnet txs, GitHub, threat model)

## Honest claims

| Claim | Verdict |
|-------|---------|
| MoneyGram supports Stellar USDC ramps | ✅ Official |
| Paysmith has MoneyGram integrated | ❌ Apply pack only |
| Sandbox ~5 min setup (Ramps marketing) | ⚠️ Partner approval still required |

## Next engineering (post-approval)

1. SEP-24 interactive flow stub in dashboard treasury page
2. Link agent offramp to SEP-24 withdrawal (separate from MoMo `/pay`)
3. Update `memory/FACT_CHECK.md` only after sandbox tx
