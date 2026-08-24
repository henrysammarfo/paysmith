# Paysmith — Compliance Notes (Ghana-first, Africa corridors)

**Updated:** 2026-08-23 | Sources: ICLG Ghana Fintech 2026, FinHive Africa guide Jun 2026, firmusadvisory PSP guide, BoG licence pages (via Tavily). **Not legal advice** — engage local counsel before live money.

## Operating model (MVP → scale)

| Phase | Model | Why |
|-------|-------|-----|
| MVP / sandbox | Software platform; funds move via **licensed PSPs** (Paystack etc.) + Stellar testnet | Avoid DEMI capital |
| Early live | Same; small volume; full KYC/AML logging | Prove product |
| Scale GH | Consider **PSP Standard** (BoG) when required | Ladder: Standard → Medium → Enhanced → Scheme → DEMI |

## Ghana PSP capital ladder (reported)

| Licence | Integrity capital (GHS) | Notes |
|---------|-------------------------|-------|
| PSP Standard | **0** | Entry; small fees (~500 process / ~1000 licence reported) |
| PSP Medium | 800,000 | |
| PSP Enhanced | 2,000,000 | |
| PSP Scheme | 8,000,000 | |
| DEMI (e-money) | 20,000,000 | Do **not** aim here early |

Directors: BoG often expects ≥3 directors, ≥2 resident in Ghana for PSP applicants (verify current BoG checklist).

## Crypto / VASP (Ghana — verified 2026-08-23)

- **Virtual Asset Service Providers Act, 2025 (Act 1154)** — in force; SEC published sandbox participants (Mar 2026 press). **Full licensing window not claimed open for everyone.**
- **BoG–SEC advertising directive (Feb 2026):** public VASP/crypto mass marketing restricted — Paysmith marketing stays **developer sandbox / testnet**, not retail “buy crypto” ads.
- Until licensed: **PSP-partner fiat** + Stellar testnet settlement; no “we are a licensed VASP” claims.
- Agent wallets: human **controller** KYC + developer KYB; agents get **policy ceilings**, not unhosted retail wallets.

## Agent-specific controls (product = compliance UX)

- Human **controller** identity behind every agent wallet  
- Spending policies (daily / max / approval)  
- Recipient allowlists for higher tiers  
- Immutable audit log → **`admin_audit_log`** (role changes; 2026-08-23)  
- Freeze / revoke API keys  

## Data protection

- Ghana Data Protection Act 2012 — register with DPC when processing personal data at scale.
