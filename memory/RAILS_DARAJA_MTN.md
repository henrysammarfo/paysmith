# Africa sandbox rails — Daraja (M-Pesa) & MTN MoMo Open API

**Updated:** 2026-08-24  
**Status:** Both sandbox rails **live** on `/pay`

## Verified smokes

| Rail | Smoke | Result |
|------|-------|--------|
| Daraja OAuth + B2C | `npm run smoke:daraja` | ✅ pending `AG_20260824_…` · provider `daraja` |
| MTN Disbursement | `npm run smoke:mtn` | ✅ pending · provider `mtn_momo` |

## Routing

| Call | Rail |
|------|------|
| `currency: KES` + `mobile_money` | Daraja B2C |
| `preferRail: "daraja"` | Force Daraja |
| `preferRail: "mtn"` | Force MTN MoMo |

## Sandbox quirks (honest)

- **Daraja B2C** is async → `/pay` returns `pending` until ResultURL callback  
- **MTN sandbox currency** is **EUR only** on their API; we map sandbox transfers to EUR while Paysmith ledger can still be GHS. Production uses `X-Target-Environment: mtnghana` + GHS after go-live  
- MTN test MSISDN e.g. `46733123450` (sandbox docs)

## Env / Edge secrets (never commit)

`DARAJA_CONSUMER_*`, `DARAJA_SECURITY_CREDENTIAL`, `DARAJA_SHORTCODE`, `MTN_MOMO_DISBURSEMENT_SUBSCRIPTION_KEY`, `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY`

Callback: `daraja-callback` Edge function for Safaricom ResultURL.
