# Paysmith — Priority Roadmap (Testnet → Grants)

**Updated:** 2026-08-23  
**North star:** Become the **go-to testnet sandbox** for developers in Africa building **AI agents that pay** — Stellar USDC + MoMo/bank sandboxes, enterprise-grade API, honest compliance. Mainnet is a later phase.

**Gate doc:** `memory/TESTNET_READINESS.md` — waitlist only after T1 green.

---

## Phase map (replaces “ship waitlist early”)

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| **T0** | Foundation P0.1–P3 | Security, rails, smokes, idempotency, RLS, reconcile | ✅ **Done** |
| **T1** | Testnet enterprise | Every angle shipped, tests green, production copy, no leaks | ✅ **Done 2026-08-23** |
| **T2** | Waitlist + community | Builder Circle NG, Stellar Ghana intro, landing push | ✅ **Launched 2026-08-24** |
| **T3** | Beta cohort | Waitlist devs on API; unique activity metrics | ⏳ After T2 traction |
| **T4** | Grants | Instaward (Ghana) → SCF Build #46 (Nov 8, 2026 — verify live) | ⏳ After T3 evidence |
| **T5** | Mainnet + live KYB | Licensed corridors, anchors, MoneyGram/Partna if fit | ❌ Not today |

**Marketing rule (revised):** No Builder Circle / Instaward blast until **T1 gate PASS**. Then each T2 touch = demo + waitlist + honest FACT_CHECK link.

---

## T0 — Foundation ✅ (was P0.1–P3)

| Pri | Outcome | Status |
|-----|---------|--------|
| P0.1 | Memory & honesty, Chimoney removed | ✅ |
| P0.2 | Webhook auth, ledger debit, threat model, RLS, reconcile, admin audit | ✅ |
| P0.3 | Paystack sandbox E2E | ✅ |
| P0.4 | Flutterwave fallback | ✅ |
| P0.5 | KYC/KYB tiers + ceilings | ✅ |
| P1 | Stellar testnet XLM + USDC | ✅ |
| P2 | Real Edge snippets, idempotency | ✅ (no npm SDK yet) |
| P3 | Local tests + smokes (no GHA) | ✅ |

---

## T1 — Testnet enterprise ✅ (2026-08-23)

### 1. Full test gate

| Task | Status |
|------|--------|
| `npm test` — policy, idempotency, concurrent helpers | ✅ 19 tests |
| `npm run smoke:ci` — webhook, reconcile, RLS | ✅ |
| `npm run test:gate` — all rail + agent + stress smokes | ✅ `memory/TESTNET_GATE.json` |
| Stress: concurrent `/pay` + idempotency | ✅ `smoke:stress` 8× → 1 debit |
| Dashboard E2E (Playwright) | ❌ Optional |

### 2. Product completeness

| Task | Status |
|------|--------|
| Edge functions deployed | ✅ |
| DB migrations on remote | ✅ |
| Soroban contract testnet deploy | ⚠️ Needs Rust + soroban-cli |
| `@paysmith/sdk` (npm) | ❌ Optional — provide npm org when ready |
| `@paysmith/cli` | ❌ Optional |

### 3. Security & compliance polish

| Task | Status |
|------|--------|
| Threat model residual risks documented | ✅ |
| No Demo Access / cross-tenant leaks | ✅ |
| Rate limits on `/pay` | ✅ |
| Double-entry journal (full accounting) | ⚠️ Single balance + reconcile |

### 4. Marketing & UI (production voice)

| Task | Status |
|------|--------|
| Landing: testnet sandbox for AI agent builders | ✅ |
| Docs: copy-paste samples match live API | ✅ |
| Pricing: sandbox free / live usage-based | ✅ |
| Blog: sandbox CTA (not “private beta”) | ✅ |
| ApiPlayground: live URL + UUID wallets | ✅ |
| Onboarding wizard | ⚠️ Manual QA optional |

---

## T2 — Waitlist + community ⏳

**Prerequisite:** `memory/TESTNET_READINESS.md` T1 all ✅ + `npm run test:gate` PASS.

| Action | Channel |
|--------|---------|
| Enable waitlist marketing | Landing `CtaSection` |
| Stellar Nigeria Builder Circle | Your accepted membership — intro + demo |
| Stellar Ghana / Instaward | `memory/INSTAWARD_SPRINT.md` |
| Thread draft | `memory/SCF_DEMO_THREAD.md` (after T1) |

**Metrics to track:** `memory/TRACTION.md` — waitlist ≥100 is a **T3** target, not T2 day-one.

---

## T3 — Beta ⏳

- Issue sandbox API keys to waitlist cohort.
- Corridors: GHS MoMo, NGN bank, Stellar testnet only.
- Weekly: unique devs, wallets, settles, Stellar tx count (honest DB queries).

---

## T4 — Grants ⏳

| Grant | Pack | Notes |
|-------|------|-------|
| Instaward (Ghana) | `INSTAWARD_SPRINT.md` | Testnet activity + demo video |
| SCF Build #46 | `SCF_BUILD_PACK.md`, `SCF_HANDBOOK.md` | Interest form first; deadline Nov 8, 2026 |
| MoneyGram Ramps | `MONEYGRAM.md` | Apply only; SEP-24 path |

**Partna:** spike only — **no Stellar** in their OpenAPI; do not pitch as Stellar offramp.

---

## T5 — Mainnet ❌ (explicitly deferred)

- Live Paystack/Flutterwave KYB per corridor.
- Stellar mainnet treasury + Circle USDC production.
- MoneyGram / Bridge after partner approval.
- BoG / VASP path documented in `memory/COMPLIANCE.md` — not blocking testnet.

---

## Partner stack (unchanged)

```
Developer → Paysmith API (agent wallet + policy + ledger)
              ├─ Fiat → Paystack / Flutterwave (sandbox now)
              ├─ USDC → Stellar testnet Horizon
              └─ Future fiat↔crypto → Partna (non-Stellar) / MoneyGram SEP-24
```

---

## Corridor priority

1. **Ghana (GHS)** — Instaward wedge  
2. **Nigeria (NGN)** — Builder Circle volume  
3. **Kenya (KES)** — Partna live  
4. **ZA** — later  

---

## SDK / CLI decision (for you)

When you have **npm org access**, T1 should publish:

| Package | Scope |
|---------|--------|
| `@paysmith/sdk` | `createAgent`, `getBalance`, `pay`, `verifyWebhook` — wraps Edge URLs |
| `@paysmith/cli` | Run smokes, print curl, fund sandbox ledger (dev ergonomics) |

Until then, **docs stay on raw fetch/curl** (already honest — no fictional SDK in samples).

---

## Research & fact-check (every phase)

- `npm run research:tavily` → `memory/TAVILY_RESEARCH.json`
- Before any grant claim: communityfund.stellar.org + handbook
- After any security change: update `FACT_CHECK.md`, `CURRENT_STATE.md`, `SESSION_LOG.md`

---

## Quick reference — old P numbers → new T phases

| Old | New |
|-----|-----|
| P0.1–P3 | T0 ✅ |
| P4 waitlist code | T1 (built) / T2 (market) |
| P5 Instaward | T4 |
| P6 Partna / MoneyGram | T4–T5 |
| P7 Soroban | T1 optional / T5 mainnet |
| P8–P10 SCF + traction | T3–T4 |
