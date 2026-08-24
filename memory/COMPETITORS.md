# Paysmith — Competitors & Positioning

**Updated:** 2026-08-22 (live research + Stellar NG builder circle intel)  
**Paysmith thesis:** Stripe for **AI agent wallets** in Africa — API-first, spending policies, multi-rail (MoMo/bank + Stellar USDC), Ghana+Nigeria corridors.

---

## A. Direct / near-direct competitors

| Player | What they are | Overlap | Their strength | Their weakness / gap | Paysmith move |
|--------|---------------|---------|----------------|----------------------|---------------|
| **Planbok** ([docs.planbok.io](https://docs.planbok.io)) | B2B programmable wallet infra; fiat on/off-ramp; ~40 chains incl. Stellar; building own SEP-6/24/31 anchor; MPC wallets; applied SCF Open Track | **High** — closest B2B API peer | Production multi-chain; MPC; anchor roadmap; SCF already applied | General business infra, not **AI-agent spending policies**; not Ghana-first | Differentiate on **agent policies + Africa MoMo UX**; optionally **partner** for wallets/KYC instead of rebuilding |
| **CowryPay** ([cowrypay.xyz](https://cowrypay.xyz)) | AI chat-to-pay; custodial wallets on Celo/Base/Solana/**Stellar**; USDC→NGN bank/MoMo | **Medium-High** — AI + Stellar + Africa payouts | Live product UX; multi-chain; intent UX | Consumer app, not developer Stripe-API; less “agent wallet with limits” | Steal UX patterns for agent chat; remain **API for developers** |
| **KoboX** ([koboxfinance.com](https://www.koboxfinance.com)) | Consumer Naira + crypto banking (cards, P2P, swap); NG focus; App Store/Play | **Low-Medium** | Traction narrative (~60M NGN / 700+ txs claimed on social); polished consumer app | Not agent API; Stellar depth unclear; retail not B2B infra | Not a rail partner; study conversion UX |
| **Afripay Finance** | Stellar-native Africa payments; SEP + Soroban | **High on Stellar** | Real contracts + anchors | Less “AI agents” narrative | Match on-chain depth; beat on agent API DX |
| **AnchorFX** | Soroban escrow + oracle FX | **Medium** | Atomic settlement architecture | Narrow FX product | Learn escrow patterns for agent holds |
| **Wirex + Ultra Stellar** | Agent payment infra on Soroban (2026) | **High narrative** | Agent + Stellar production story | Enterprise-heavy | Ship agent demo with on-chain proof |

## B. Rails / infra (partners more than competitors)

| Player | Role | Notes for Paysmith |
|--------|------|-------------------|
| **Partna** ([docs.getpartna.com](https://docs.getpartna.com)) | Africa stablecoin on/off-ramp API (NGN, GHS, KES ↔ USDC/USDT) | Strong **Chimoney replacement** candidate for crypto↔fiat |
| **Busha Business API** | NG crypto buy/sell/convert; KYC inherited; sandbox ~1–2 weeks integrate | KYB 48–72h; verify Stellar asset support before committing |
| **Quidax API** | Africa crypto API; NG/GH/TZ | Builder circle: **KYB hectic**; needs KYC provider SLA; moderate spreads; **Stellar support uncertain** |
| **Yellow Card** | Africa fiat crypto corridor; USDC on Stellar presence | Enterprise ramp partner |
| **NGNC (Link.io)** | Naira stablecoin on Stellar (+ other chains) | Builder circle asking about SEP-24/31 liquidity — evaluate as NGN path payment asset |
| **Pollar** ([pollar.xyz](https://pollar.xyz)) | Embedded wallets + ramp orchestrator; **Stellar + Solana**; in-SDK KYC modes | Circle said “wallet + KYC inbuilt”; site is **LATAM-first** — verify Africa rails before relying |
| **MoneyGram Ramps** | Cash ↔ USDC on Stellar (SEP) | SCF Integration List — high credibility |
| **Bridge (bridge.xyz)** | Multi-currency + Stellar settlement | SCF Integration List — fast integrate |
| **Paystack** | Fiat bank/MoMo (NG, GH, …) | Primary **fiat** payout API (replaces Chimoney) |
| **Flutterwave** | Fiat bank/MoMo Africa | Keep as secondary fiat rail |
| **Cowrie** (not CowryPay) | Historic Stellar NG bank rails | Different entity from CowryPay — don’t confuse |

## C. Off-Stellar payment APIs (Stripe analogues)

| Player | Fit |
|--------|-----|
| **Paystack** | Best sandbox + GH/NG MoMo/bank — **P0 replace Chimoney** |
| **Flutterwave** | Already partially wired — harden |
| **Chipper / Wave** | Consumer; harder B2B API |
| **Chimoney** | **DEAD for Paysmith** — remove |

## D. Competitive matrix (honest)

| Capability | Paysmith today | Planbok | CowryPay | Paystack alone |
|------------|----------------|---------|----------|----------------|
| AI agent wallets + spending policy | Schema yes / Stellar no | Partial | No (consumer AI) | No |
| Developer REST API | Yes | Yes | No | Yes (fiat only) |
| Stellar USDC settlement | ❌ | Extending | Yes (wallet) | ❌ |
| Ghana MoMo | Claimed / stub | Via partners | Via chains | Yes |
| On-chain proof for SCF | ❌ | Applying | Live multi-chain | N/A |

## E. Ghana strategy (market wedge)

- Nigeria dominates SCF-funded Africa payments narratives; **Ghana Stellar community is thin** → less competition, chapter Instaward path, GHS + MTN MoMo story.
- Wins: “First production AI-agent payout API with Stellar USDC + Ghana MoMo.”
- Do not fake residency badges; earn Instaward → Build.

## Partner vs vendor (read with ROADMAP.md)

| Relationship | Who | When |
|--------------|-----|------|
| **Vendor (self-serve)** | Paystack, Flutterwave, Stellar testnet | Now |
| **Peer partner** | Planbok, Partna | After hello + sandbox |
| **Enterprise partner** | MoneyGram, Bridge, Yellow Card | After traction (P8) |

Do not wait for MoneyGram to ship MVP. 
