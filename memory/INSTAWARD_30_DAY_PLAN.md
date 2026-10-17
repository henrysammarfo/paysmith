# Paysmith — Instaward 30-day plan (criteria-aligned)

**Ask:** **$4,000 USD in XLM**  
**Sprint:** Day 0 = Demo Day 17 Oct 2026 → Day 30 = 16 Nov 2026  
**Chapter:** Stellar Ghana (Kaleel)  
**Why this amount:** Concrete delivery (Relayer + SDK upgrade + Smart Account scaffold + Ghana demo video) — not vague research; matches Instaward §5–§6.

---

## North-star (checkable at Day 30)

1. **On-chain:** ≥10 Stellar testnet USDC settles in sprint window (explorer links in report)  
2. **Soroban:** Policy contract redeployed with `set_wallet_policy` live; Lab invoke demo  
3. **Relayer path:** OpenZeppelin Relayer *or* documented Channels spike with fee-bump on one treasury tx  
4. **Smart accounts:** Freighter live + Smart Account Kit scaffold wired in SDK (`smartAccountKitScaffold`) with env placeholders documented  
5. **DX:** `@paysmithhq/sdk` documents Stellar helpers; MCP smoke for create+balance  
6. **Traction:** ≥100 waitlist **or** ≥50 if chapter agrees + ≥20 returning sandbox actives  
7. **Security:** Threat model + monitoring note updated (Build T2 ready)  
8. **Demo:** 3-min public Loom + `/stellar` Freighter path  

---

## Week 1 (17–24 Oct) — Demo Day follow-through

| Deliverable | Owner | Done when |
|-------------|-------|-----------|
| Redeploy Soroban wasm (admin/policy) | Eng | New contract ID in Edge secrets + Lab |
| Freighter `/stellar` polished | Eng | Connect works on judge laptop |
| Chapter thank-you + Loom | Lead | Link in Discord/WhatsApp |
| Waitlist push (GH/NG communities) | Lead | +25 signups |

**Sentiment driver:** Judges remember Freighter + explorer hash, not slides.

## Week 2 (25–31 Oct) — Reliability & Relayer

| Deliverable | Owner | Done when |
|-------------|-------|-----------|
| Upgrade Edge `@stellar/stellar-sdk` toward 17.x | Eng | smoke:stellar + smoke:stellar-usdc PASS |
| OZ Relayer / Channels spike | Eng | Doc + 1 fee-bumped tx OR blocker log |
| Stress + RLS + webhook gates | Eng | `npm run test:gate` green |
| Smart Account Kit install spike | Eng | README + env template |

**Market driver:** Funded Africa projects win with **stablecoin ↔ local rails reliability**. Relayer fixes our treasury sequence race.

## Week 3 (1–7 Nov) — Agent + MoMo narrative

| Deliverable | Owner | Done when |
|-------------|-------|-----------|
| Agent e2e: create → policy → Stellar pay script in CI | Eng | `smoke:agent-stellar` in gate |
| Ghana MoMo sandbox demo pack | Eng | Paystack smoke + video clip |
| SEP-24 / Anchor spike note (MoneyGram/Bridge) | Eng | 1-pager in memory |
| Builder Circle / Discord office-hours update | Lead | Engagement proof for §4 |

**Human sentiment:** “Show me MoMo + USDC in one flow” — chapter + SCF #45 theme.

## Week 4 (8–16 Nov) — Report & next fund

| Deliverable | Owner | Done when |
|-------------|-------|-----------|
| Instaward completion report (metrics + links) | Lead | PDF/MD to Chapter Lead |
| SCF Interest Form draft (Open: agent wallets) | Lead | Submitted or queued |
| Roadmap freeze for follow-on $1–5k | Team | Only ship what was promised |
| KYC pack ready | Lead | stellar.org/bd-kyc docs collected |

---

## Explicitly NOT in this 30-day sprint (roadmap)

| Item | Why later | Target |
|------|-----------|--------|
| Mainnet corridors / live KYB | License + KYB | Post-Instaward / Build |
| Full Smart Account passkey production | Needs wasm hash + audit | Week 2–3 spike only |
| Production OZ Relayer hosting | Ops cost | Spike → Build Integration |
| Partna / Yellow Card live | Partner KYB | After sandbox cohort |
| Pen test | Budget | SCF Audit Bank when Build |

---

## 5-year / 10-year thesis (appendix — not sprint scope)

- **5y:** Agents are first-class payers; policy + compliance APIs win; Africa MoMo+USDC standard  
- **10y:** Agent-to-agent settlement; Stellar as settlement if SEPs/liquidity win; Paysmith = infra layer  

Instaward judges fund **30-day execution**, not this appendix.

---

## Who does what

| Role | Person | Work |
|------|--------|------|
| Contact / chapter / growth | Henry Sam Marfo | Form, Loom, waitlist, report |
| Contracts / Edge / smokes | [Teammate 2] | Soroban, Relayer, SDK |
| Frontend / Freighter / docs | [Teammate 3] | `/stellar`, Lab links, docs |

---

## Award use of funds ($4k)

| Bucket | ~$ | Purpose |
|--------|-----|---------|
| Stellar infra / Relayer ops | 1,200 | Channels / RPC / deploy |
| Engineering sprint (contracts+SDK) | 1,800 | Weeks 1–3 delivery |
| Demo / Loom / chapter travel | 400 | Demo Day follow-ups |
| Contingency / XLM volatility buffer | 600 | Per SDF XLM volatility note |
