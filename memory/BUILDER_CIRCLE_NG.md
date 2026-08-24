# Stellar Nigeria Builder Circle — intro pack (T2)

**For:** Builder Circle NG membership (accepted)  
**Updated:** 2026-08-24

## One-liner

Paysmith is a **testnet sandbox API** for AI agents that pay in Africa — MoMo + bank sandboxes (Paystack/Flutterwave) and **USDC on Stellar testnet**, with spending caps and idempotency.

## What to share (honest)

| Demo | Proof |
|------|-------|
| Create agent wallet | `POST /agents-create` or `npx paysmith create …` |
| MoMo sandbox | Paystack GH smoke |
| Stellar USDC | Horizon hash on stellar.expert |
| Agent SDK | `@paysmithhq/sdk@0.2.0` on npm |
| MCP for builders | `@paysmithhq/mcp` |

## Suggested intro message (Discord / Circle channel)

> Hi — I'm building **Paysmith** from Accra: policy-bound wallets for AI agents paying via **MoMo/bank sandboxes + Stellar testnet USDC**.  
> We have Paystack/Flutterwave sandboxes, idempotent `/pay`, RLS isolation, and `@paysmithhq/sdk` on npm.  
> Looking for NG builders to stress-test NGN bank rails and agent MCP flows. Waitlist: [your landing URL] — docs in repo / site.

## 15-min demo agenda

1. `npx paysmith wallets` (2 min)
2. Create wallet + pay GHS MoMo with Idempotency-Key (5 min)
3. Stellar USDC `/pay` + explorer link (3 min)
4. Spending policy 403 on over-limit (2 min)
5. Q&A — compliance: sandbox only, PSP partners for fiat

## Ask from Circle

- 3–5 devs to run `npm i @paysmithhq/sdk` against sandbox keys
- Feedback on NGN corridor priority vs KES Daraja spike
- Pointer to Stellar Ghana chapter for Instaward alignment

## Do not claim

- Mainnet NGN live corridors
- Partna + Stellar (Partna has no Stellar in OpenAPI)
- Pen-test complete (`docs/PEN_TEST_STATUS.md`)
