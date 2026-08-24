# Paysmith Full Audit Report

**Date:** 2026-08-22 (baseline) · **Delta:** 2026-08-23 P0 fixes applied (see `memory/FACT_CHECK.md`)

## Executive summary

Paysmith is a **B2B payment API MVP** for AI agents in Africa. Sandbox rails (Paystack, Flutterwave, Stellar XLM/USDC) settle in test; P0 security holes from the 08-22 audit (webhook auth, ledger debit, RLS Demo Access, reconcile) are **mitigated**. We do **not** claim unhackable or pen-test complete.

### Still open vs this audit
- Double-entry journal (single-balance debit today + reconcile)
- Soroban on-chain policy
- External pen test / SCF Build submission traction
- Live corridors / MoneyGram / Partna (roadmap P5+)

---

## Architecture

### Strengths

- Clean 3-endpoint API (`agents-create`, `agents-balance`, `pay`)
- RLS on all core tables; admin RBAC via `has_role()`
- Spending policies (daily limit, max tx, approval threshold)
- Outbound webhook HMAC signing
- Developer UX: onboarding wizard, API playground, webhook logs

### Critical gaps (08-22) → 08-23 status

| Issue | 08-22 | 08-23 |
|-------|-------|-------|
| Balances never debited | Open | ✅ Debit after rail + reconcile |
| Webhook deliver unauthenticated | Open | ✅ Service-role / internal secret |
| Crypto → Chimoney | Open | ✅ Removed; Stellar Horizon |
| Sandbox instant settle only | Open | ✅ Real PSP/Horizon smokes |
| RLS Demo Access open | (later found) | ✅ Fixed; `smoke:rls` |
| No admin role audit | Open | ✅ `admin_audit_log` |
| Docs fictional SDK | Open | ✅ Real Edge snippets |

---

## Stellar integration score: ~6/10 (testnet)

Present: Horizon XLM + USDC settle, explorer hashes, treasury trustline.  
Missing: Soroban policy, SEP-24/31 anchors, production custody story.

Missing entirely:

- `@stellar/stellar-sdk` / Horizon
- Soroban contracts (spending policy escrow)
- SEP-10, SEP-24, SEP-31 anchors
- Freighter / wallet connect
- Stellar tx hashes in transaction records
- Stellar.expert links (Wallets external link is inert)

---

## Testing & CI

| Check | Status |
|-------|--------|
| Unit tests | Placeholder (`expect(true).toBe(true)`) |
| E2E (Playwright) | Config only, 0 spec files |
| Smoke tests (API) | None |
| Stress tests | None |
| RLS write-access tests | `npm run smoke:rls` PASS (fixed open Demo Access 2026-08-23) |
| Penetration test | None |
| CI pipeline | None |
| Build verified 0 errors | Not confirmed (npm install incomplete during audit) |

---

## UI/UX

**Good for Stripe-like API product:** dashboard, wallet list, txn history, API keys, docs search.

**Missing for Stellar/fintech credibility:**

- Wallet connect (Freighter)
- On-chain tx explorer links
- Swap/bridge/stake flows (optional unless product expands)
- Consistent spacing/typography polish vs Jupiter, Uniswap, Stripe patterns
- Pricing page is placeholder ("coming soon")

---

## Competitors (Stellar, Africa payments)

| Project | Stellar depth | Notes |
|---------|--------------|-------|
| Afripay Finance | High | SEP + Soroban + Africa stablecoins |
| AnchorFX | High | Soroban escrow + oracle |
| Kutana Technologies | High | Selected Stellar x CV Labs cohort 1 |
| JoonaPay | Medium | CV Labs cohort 1, Francophone WA |
| Wirex + Ultra Stellar | High | Agent payment infra on Soroban (2026) |

Paysmith today competes narratively with Chimoney/Flutterwave APIs, not Stellar-native builders.

---

## Prioritized roadmap

### P0 — Blockers (do first)

1. Stellar testnet USDC treasury + per-wallet settlement via Horizon
2. Soroban spending-policy contract (or documented off-chain policy with on-chain settlement)
3. Fix `webhook-deliver` auth (service-role JWT or internal signed token)
4. Double-entry ledger — debit on pay, credit on deposit
5. Align marketing with shipped code
6. GitHub Actions: lint + vitest + edge function integration tests

### P1 — Accelerator differentiation

7. SEP-31 anchor partner (Yellow Card, MoneyGram corridor)
8. Freighter connect for admin/treasury
9. Idempotency keys on `/pay`
10. Fix docs field names + broken realtime
11. KYC tier schema + SEP-12 stub

### P2 — Enterprise / VC

12. Distributed rate limiting (Upstash Redis)
13. External pen test + threat model
14. Reconciliation jobs (provider + Horizon)
15. Architecture docs for due diligence

---

## Target architecture (Stellar + existing rails)

```
POST /pay
  → Policy check (edge function + optional Soroban)
  → Branch:
      mobile_money/bank → Chimoney / Flutterwave (keep)
      usdc → Stellar Horizon transfer (ADD)
  → Postgres ledger (source of truth) + stellar_tx_hash column
  → Authenticated webhook-deliver → HMAC to developer URL
```
