# Paysmith — Testnet Enterprise Readiness Gate

**Purpose:** Do **not** launch waitlist, Builder Circle pitch, or Instaward thread until this gate is green.  
**Positioning:** The default **testnet sandbox for AI agent payments in Africa** — production-grade API, honest compliance, Stellar testnet + licensed PSP sandboxes. Not mainnet today.

**Updated:** 2026-08-23 — **T1 GATE PASS** (`memory/TESTNET_GATE.json`)

---

## Gate rule

| Order | Phase | Ship when |
|-------|-------|-----------|
| 1 | **T1 Testnet enterprise** | ✅ Green 2026-08-23 |
| 2 | **T2 Waitlist + community** | Ready to start when you say go |
| 3 | **T3 Beta cohort** | Waitlist traction |
| 4 | **T4 Grants** | T3 evidence → Instaward / SCF #46 |
| 5 | **T5 Mainnet / live corridors** | Not today |

---

## T1 checklist

### Rails & ledger

| Item | Status | Evidence |
|------|--------|----------|
| Paystack MoMo GHS | ✅ | `smoke:paystack` |
| Flutterwave bank | ✅ | `smoke:flutterwave` |
| Stellar XLM / USDC | ✅ | smokes + explorer hashes |
| Ledger + idempotency | ✅ | vitest + live |
| Concurrent same key → 1 debit | ✅ | `smoke:stress` 8× parallel |
| Reconcile + cron | ✅ | smoke + Vault |
| Atomic debit↔rail | ⚠️ Mitigated | Documented in FACT_CHECK |

### Security

| Item | Status |
|------|--------|
| Webhook / reconcile 401 | ✅ |
| RLS cross-tenant | ✅ |
| KYC/KYB ceilings | ✅ |
| Admin audit | ✅ |
| Threat model draft | ✅ |
| External pen test | ❌ Not claimed |
| Soroban on-chain | ⚠️ Scaffold |

### DX & marketing

| Item | Status |
|------|--------|
| Real Edge docs / samples | ✅ |
| Pricing: sandbox free | ✅ |
| Blog: sandbox (not “private beta”) | ✅ |
| Playground: live URL + UUID wallets | ✅ |
| Hero: testnet sandbox voice | ✅ |
| `@paysmith/sdk` | ❌ Optional |

### Tests

| Suite | Status |
|-------|--------|
| `npm test` (19) | ✅ |
| `npm run test:gate` | ✅ |
| Stress | ✅ |
| Browser E2E | ❌ Optional |

---

## T2 — Waitlist + community (next)

1. Confirm `memory/TESTNET_GATE.json` still current
2. Landing waitlist (`#waitlist`) — push in Builder Circle NG + Stellar Ghana
3. Demo: `memory/INSTAWARD_SPRINT.md` + `memory/SCF_DEMO_THREAD.md`
4. Do **not** claim mainnet, Partna+Stellar, or Soroban deploy

---

## What we never claim

- Unhackable / pen-test complete  
- Mainnet live corridors today  
- Partna + Stellar USDC  
- Soroban enforced on-chain until deployed  
