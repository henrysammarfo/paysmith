# Paysmith — Full stack overview (2026-08-23)

**Verdict:** T1 **testnet enterprise sandbox** is real and gated. Positioning = **Stripe-for-AI-agents in Africa** via MoMo/bank sandboxes + Stellar USDC — not card-only agent commerce. Grants/waitlist = T2+ after you push community.

---

## 1. What exists (root → tip)

### Product surface
| Layer | Status |
|-------|--------|
| Landing + waitlist CTA | ✅ Production voice; sandbox pricing |
| Docs / API playground | ✅ Real Edge URLs + UUID wallets |
| Dashboard (wallets, txs, keys) | ✅ Stellar explorer links |
| Blog | ✅ Sandbox thesis (not fake “private beta”) |

### API (Edge)
| Function | Status |
|----------|--------|
| `agents-create` / `agents-balance` | ✅ Live schema |
| `pay` | ✅ Multi-rail + idempotency + **Soroban check_spend simulate** |
| `webhook-deliver` | ✅ Auth required |
| `reconcile-ledger` | ✅ + 15m cron |
| `partna-quote` | Stub — Partna has **no Stellar** |

### Rails
| Rail | Status |
|------|--------|
| Paystack MoMo (test) | ✅ Settle smoke |
| Flutterwave bank (test) | ✅ Settle smoke |
| Stellar XLM / USDC testnet | ✅ Horizon settle |
| Soroban spending-policy | ✅ Deployed `CAOJF27…W5ZY` |

### SDK
| Item | Status |
|------|--------|
| `packages/sdk` `@paysmith/sdk` | ✅ Builds |
| npm publish | ✅ `@paysmithhq/sdk@0.1.1` |

---

## 2. Security & compliance (honest)

- Threat model: `docs/THREAT_MODEL.md` (updated for Soroban + VASP advertising risk).
- Compliance: PSP-partner model; **no VASP licence claim**; Ghana Act 1154 sandbox era — see `memory/COMPLIANCE.md` + research note.
- Never claim unhackable / pen-test complete.

---

## 3. Research insight (Tavily 2026-08-23)

Full write-up: `memory/RESEARCH_AGENT_RAILS.md`.

**Thesis confirmation:** Global agent checkout is card-heavy; Africa MoMo volume is the gap. Competitors (Pretium, IvoryPay, CowryPay) touch pieces — none owns “agent wallet API + GH/NG MoMo sandbox + Stellar USDC policy” as a category.

**Next free sandboxes to evaluate (not integrated):** Daraja M-Pesa, MTN Open API where available, MoneyGram Ramps SEP-24 apply, Chipper/YC sandboxes. **Avoid** pitching Partna as Stellar.

---

## 4. Roadmap phases

| Phase | Status |
|-------|--------|
| T0 Foundation | ✅ |
| T1 Testnet enterprise | ✅ (+ Soroban enforce in `/pay`) |
| T2 Waitlist + Builder Circle NG / Stellar Ghana | ⏳ Your call |
| T3 Beta cohort metrics | ⏳ |
| T4 Instaward / SCF #46 (Nov 8, 2026 — verify live) | ⏳ |
| T5 Mainnet / live KYB | ❌ Not today |

---

## 5. What you do next

1. **npm** — Follow `docs/NPM_PUBLISH_SETUP.md` → paste `NPM_TOKEN` → say **publish sdk**.  
2. **T2** — Say **go T2** for waitlist + chapter outreach pack.  
3. Optional: valid TinyFish key for deeper scrape research.

---

## 6. Fact anchors

- Contract: `memory/SOROBAN_DEPLOY.json`  
- Gate: `memory/TESTNET_GATE.json`  
- Facts: `memory/FACT_CHECK.md`  
- Rails research: `memory/RESEARCH_AGENT_RAILS.md`
