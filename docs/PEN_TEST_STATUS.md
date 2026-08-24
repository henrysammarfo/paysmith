# Penetration test status

**Last updated:** 2026-08-24  
**Verdict:** No external penetration test has been completed. Do **not** claim “pen-test complete” or “unhackable.”

## What we have instead

| Control | Evidence |
|---------|----------|
| Threat model draft | `docs/THREAT_MODEL.md` |
| Automated smokes | `npm run smoke:ci`, RLS, webhook 401, reconcile |
| Unit tests | vitest policy, idempotency, ledger helpers |
| Honest fact check | `memory/FACT_CHECK.md` |

## Residual risks (non-exhaustive)

1. API key theft → rate limits + rotation (documented; not pen-tested)
2. Webhook spoofing → inbound auth + HMAC docs for developers
3. Balance manipulation → double-entry ledger + reconcile (not one atomic txn with every rail)
4. Provider failure → idempotency + pending state machine
5. Admin abuse → audit log on role changes
6. In-memory rate limits per Edge isolate
7. CORS `*` on Edge functions
8. Soroban policy: off-chain ledger still used for pre-check; on-chain `try_spend` after contract redeploy

## Recommended before production mainnet

1. Third-party pen test (scoped: Edge API + dashboard + webhook path)
2. Bug bounty or repeat test after major rail changes
3. SOC2 / ISO path only if enterprise customers require it — not started

## Internal test gate (run before grant posts)

```bash
npm run test:gate
node scripts/smoke-npm-packages.mjs
```
