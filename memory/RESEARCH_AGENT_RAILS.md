# Research — Stellar security, Africa rails, agent MoMo (2026-08-23)

**Sources:** Tavily live (`memory/TAVILY_RESEARCH.json`) + SEC Ghana / SDF-adjacent docs cited below.  
**Rule:** Claims here must not contradict `memory/FACT_CHECK.md`.

---

## 1. Category gap (why Paysmith exists)

AVODA Group (Aug 2026): global agent-commerce stacks (Visa / Mastercard / ChatGPT Instant Checkout) settle on **cards**, not M-Pesa / MTN MoMo. Sub-Saharan MoMo was ~**$1.4T** in 2025 — largely invisible to SF/NY agent standards.

**Paysmith wedge:** developer API so AI agents pay **MoMo + bank sandboxes + Stellar USDC**, with spending policies — not “buy crypto then hope.”

Adjacent players (not same product):
| Player | Angle | Diff |
|--------|--------|------|
| Pretium | Agent spend + stablecoin offramp KE/UG/NG (Celo/Base/BNB) | Not Stellar-first; not GH MoMo wedge |
| IvoryPay | x402 / Algorand M2M across 16 countries | Different chain; not agent-wallet API |
| CowryPay | Consumer AI + Stellar wallet | Not B2B Stripe-for-agents |
| Paystack / Flutterwave | Licensed MoMo/bank | No agent policy layer |

---

## 2. Stellar / Soroban security posture (Paysmith)

Aligned with SDF builder norms (Horizon + Soroban):

| Practice | Paysmith status |
|----------|-----------------|
| Separate treasury secret; never in client | ✅ Edge env only |
| Testnet before mainnet | ✅ Explicit T5 deferral |
| On-chain spend policy attestation | ✅ Contract + `/pay` simulate `check_spend` |
| Fail-closed policy / rail | ✅ Off-chain + Soroban; soft-fail only via `STELLAR_SOROBAN_SOFT_FAIL=1` |
| Idempotency / no double rail | ✅ + stress smoke |
| Webhook auth | ✅ Internal secret / service role |
| Threat model documented | ✅ `docs/THREAT_MODEL.md` |
| External audit | ❌ Not claimed |

Residual (honest): Edge CORS `*`; in-memory rate limits; rail≠SQL atomic; no pen-test report.

---

## 3. Ghana / Africa compliance (must stay honest)

| Item | Finding (2026) | Paysmith action |
|------|----------------|-----------------|
| **VASP Act 1154** | Law in force; SEC sandbox participants announced Mar 2026; full licensing not fully open | No “licensed VASP” claims; PSP-partner model |
| **Crypto advertising** | BoG–SEC joint directive (Feb 2026) restricted public VASP ads | Marketing = **developer sandbox / testnet**, not retail crypto ads |
| **PSP Standard** | Entry BoG path with low/no integrity capital (verify live BoG) | Long-term ladder in `COMPLIANCE.md` |
| **Agent ≠ human** | Controllers need KYC; agents need policies | tier0/1/2 ceilings + audit |

---

## 4. Sandbox / free rails to deepen (roadmap)

Already wired: Paystack test, Flutterwave test, Stellar Friendbot + Circle testnet USDC.

**Investigate next (no false “integrated” claims):**

| Rail | Why | Status |
|------|-----|--------|
| Safaricom Daraja (M-Pesa) sandbox | KE MoMo agent demos | Not integrated |
| MTN MoMo Open API (where available) | Direct GH/elsewhere | Via Paystack today |
| Chipper / Yellow Card sandboxes | Cross-border FX | Not integrated |
| MoneyGram Ramps SEP-24 | Cash ↔ Stellar USDC | Apply pack only |
| Partna | NG/KES stablecoin | **No Stellar** in OpenAPI — don’t pitch as Stellar offramp |
| x402 / agent micropay standards | M2M crypto | Watch; Stellar path preferred |

---

## 5. Product thesis (locked)

> Developers building AI agents for Africa use Paysmith’s **testnet/sandbox** to give each agent a **policy-bound wallet** that can pay **mobile money and bank**, and settle **USDC on Stellar** — without forcing end users through card networks or ad-hoc crypto onboarding.

Machine-to-machine: agents pay agents / services within caps; humans KYB the developer and KYC controllers.

---

## 6. Update triggers

Re-run: `npm run research:tavily -- "…"` before SCF / Instaward submissions.  
TinyFish: only when a valid API key is provided (prior key was invalid).
