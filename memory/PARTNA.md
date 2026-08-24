# Partna — P6 (fact-checked from official OpenAPI)

**Verified:** 2026-08-23 — [Partna v4 docs](https://docs.getpartna.com/v4/documentation/introduction) + OpenAPI `GET /supported/assets`

## Markets

| Market | Status |
|--------|--------|
| NGN | Live |
| KES | Live |
| GHS | **Launching** (not live) |

## Stellar USDC — verdict

**❌ Not supported on Partna ramp networks today.**

Official OpenAPI network examples for USDC: **celo, ethereum, solana, tron** (staging/production asset trees). **No `stellar` network enum** in published spec.

**Implication for Paysmith:** Stellar treasury payouts stay on **Horizon** (`/pay` crypto). Partna offramp would require a **separate EVM/TRON USDC treasury** — not the current Stellar-only architecture. Do not claim Partna + Stellar USDC bridge without a designed bridge partner.

## When Partna still helps (future)

- **NGN/KES offramp** if treasury holds USDC on **tron/ethereum** (different product shape)
- **Onramp** fiat→USDC to fund non-Stellar treasury
- **GHS** when Partna marks market Live

## API (when keys exist)

- Auth: `x-api-key` + `x-api-user`
- Rate: `GET /v4/rate`
- Ramp: `POST /v4/ramp` (`fiatToCrypto` | `cryptoToFiat`)
- Staging: `https://staging-api.getpartna.com/v4`

## Code status

- Edge stub: `partna-quote` (returns 501 until `PARTNA_API_KEY` + `PARTNA_API_USER`)
- **Not wired to `/pay`** — architectural mismatch with Stellar treasury

## Blockers

- [ ] Partna sandbox credentials
- [ ] GHS live confirmation
- [ ] Product decision: dual treasury (Stellar + EVM) vs Paystack-only fiat offramp
