# Paysmith — Funding & Ecosystem Opportunities (Stellar-focused)

**Last researched:** 2026-08-22 via Tavily + live web fetch  
**Fit note:** Stellar Horizon + USDC smokes PASS (Aug 2026). SCF Build requires interest form + traction growth.

**SCF #46 Build submit:** November 8, 2026 (communityfund.stellar.org — re-verify live).

**Live traction (2026-08-23):** waitlist 0 · agent wallets 20 · transactions 27 — see `memory/TRACTION.md`.

---

## Tier 1 — Best fit once Stellar is built

### Stellar Community Fund (SCF) — Build Track

| Field | Detail |
|-------|--------|
| URL | https://communityfund.stellar.org |
| Award | Up to **$150,000 XLM** per submission |
| Cadence | Rolling rounds (~every 4 weeks); SCF 7.0 launched Jan 2026 |
| **SCF #46 deadline** | **Build submission: Nov 8, 2026** |
| Panel review | Nov 11–18, 2026 |
| Community vote | Nov 23 – Dec 3, 2026 |
| Fit | AI agent payments, USDC settlement, Africa corridors |
| Blocker today | Must show on-chain Stellar work + deliverables per SCF Handbook |
| Tip | Indicate interest early; referrals from SCF alumni/accelerators speed review |

### Stellar x CV Labs Accelerator

| Field | Detail |
|-------|--------|
| Focus | DeFi, payments, RWA — EMEA including Africa |
| Award | Up to **$150,000 XLM** + perks |
| Format | 12 weeks remote + Cape Town bootcamp + Demo Day at Meridian (Lisbon) |
| Listed deadline | **03-Jul-2026** (fundsforNGOs) |
| Status Aug 2026 | **First cohort already selected** (10 teams; 3 African: JoonaPay, Kutana, Yolat) |
| Next step | Monitor for cohort 2; build Stellar integration now |

### Soroban Adoption Fund

| Field | Detail |
|-------|--------|
| URL | https://stellar.org/soroban |
| Size | **$100M** adoption fund (SDF) |
| Includes | SCF + supporting programs |

---

## Tier 2 — Africa fintech (chain-agnostic; Stellar story helps)

| Program | Stage | Notes | Status Aug 2026 |
|---------|-------|-------|-----------------|
| **Ajim Capital** | Pre-seed/seed $250k–$500k | Africa fintech infra focus | Rolling applications |
| **IFC Fintech Innovation Challenge** | Varies | Africa fintech | Check current window |
| **Ecobank Fintech Challenge** | Varies | Africa | Check current window |
| **Tony Elumelu Foundation** | Grant + mentorship | Broad Africa | Annual cycle |
| **Visa Africa Accelerator** | Growth support | Listed deadline Mar 15, 2025 in Tavily — **likely closed** | Verify before applying |
| **Y Combinator** | Pre-seed/seed | Spring/Summer batches; stablecoin option from Spring 2026 | Check ycombinator.com/apply |
| **Interledger Mini-Grants** | $500–$3,000 | Open payments / inclusion | Deadline **Nov 11, 2026** |

---

## Tier 3 — Stellar ecosystem partners (integration > grant)

| Partner | Relevance to Paysmith |
|---------|----------------------|
| **Yellow Card** | Africa fiat on/off ramp; USDC on Stellar |
| **MoneyGram / MGUSD** | Cash corridors; Stellar-native stablecoin |
| **Wirex + Ultra Stellar** | Agent payment infra on Soroban (direct competitor pattern) |
| **Partna / Paystack / Busha** | Fiat + stablecoin partners — see `memory/RAILS_AND_PARTNERS.md` |
| **Afripay Finance** | Stellar-native Africa competitor (SEP-24/31, Soroban) |
| **AnchorFX** | Soroban escrow + oracle cross-border model |

---

## Why accelerator applications fail (Paysmith-specific)

1. **Stellar badge without Stellar code** — reviewers check GitHub and testnet txs
2. **No demo tx hashes** — need Horizon-visible USDC transfers
3. **Security gaps** — unauthenticated webhooks, no ledger integrity
4. **No test coverage / CI** — signals not production-ready
5. **Docs/API mismatches** — `to` vs `recipient` in docs hurts trust

---

## Recommended application sequence

```
Week 1–4:  Stellar testnet USDC + Soroban spending policy + fix P0 security
Week 5–6:  CI + smoke/integration tests + threat model v1
Week 7–8:  SCF "Indicate Interest" + referral outreach (Stellar ambassadors, SCF alumni)
Week 9+:   SCF #46 Build submission (deadline Nov 8, 2026)
Parallel:  Ajim Capital / YC if traction metrics exist
```

---

## API keys for research

| Service | Status |
|---------|--------|
| Tavily (`TAVILY_API_KEY`) | ✅ In `.env`; `memory/TAVILY_RESEARCH.json` (2026-08-23) |
| TinyFish | ❌ No valid key in repo (SESSION_LOG 2026-08-22) |
| WebFetch / Partna OpenAPI | ✅ Used for Partna Stellar verdict Aug 2026 |
