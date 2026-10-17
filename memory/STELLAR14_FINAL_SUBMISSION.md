# Stellar 14 Demo Day — Final submission pack

**Date:** 2026-10-17  
**Venue:** Payaza Africa, Labone · 12–3pm GMT  
**Project:** Paysmith — policy-bound agent wallets (Africa MoMo sandboxes + Stellar testnet)

Copy answers from `memory/STELLAR14_DEMO_DAY_FORM.md`. This file is the judge-facing link sheet + evidence.

---

## Live links (fresh)

| What | URL |
|------|-----|
| Product | https://paysmith-eight.vercel.app |
| Freighter demo | https://paysmith-eight.vercel.app/stellar |
| Waitlist | https://paysmith-eight.vercel.app/#waitlist |
| Public repo | https://github.com/henrysammarfo/paysmith |
| Soroban Lab (v3) | https://lab.stellar.org/r/testnet/contract/CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW |
| Deploy tx | https://stellar.expert/explorer/testnet/tx/6f7d2fb0841693ab383431e18469052d6cd4370bc6c57729cad727e4e16182ce |
| `try_spend` proof | https://stellar.expert/explorer/testnet/tx/176706a7ed504f18890182e904dad54901b2e3f0ef1861e1fc112ed1c1440a7d |

**Contract ID:** `CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW`  
**Wasm hash:** `f3870fa4612ce74276379d21345159e3ba8a826175b0219a9f9eef39c5439e9c`

---

## Criteria A→Z (summary)

Full table: `memory/INSTAWARD_CRITERIA_A_TO_Z.md`  
Peers researched: SCF #36/#38/#44/#45 Africa + Nigeria (Yolat, Jumpa, Azza, Seevcash, Sorted, Kutana, Lomi, …).  
Instaward ask: **$4,000 XLM** · 30-day plan: `memory/INSTAWARD_30_DAY_PLAN.md` (sentiment-driven: live Stellar proof → Relayer reliability → MoMo+USDC narrative).

---

## What shipped in Stellar 14 window

1. Soroban spending-policy **v3** on SDK **29.0.1** — `init_admin`, `set_wallet_policy`, `get_wallet_policy`, `try_spend`, `get_spent`, `check_spend`  
2. Freighter `/stellar` + Lab explorer  
3. `@paysmithhq/sdk` — Stellar helpers, Smart Account scaffold, **OpenZeppelin Relayer client**  
4. Edge `/pay` stellar-sdk **14.2.0** + legacy contract-ID remap to v3  
5. Agent e2e smoke `npm run smoke:agent-stellar`  
6. Ecosystem map `docs/STELLAR14_ECOSYSTEM.md` · Relayer doc `docs/OZ_RELAYER_SMART_ACCOUNT.md`

---

## Tests run (2026-10-17)

| Suite | Result |
|-------|--------|
| `cargo test` (spending-policy) | ✅ 4/4 |
| `stellar contract build` + deploy | ✅ new contract ID |
| on-chain `try_spend` | ✅ explorer tx above |
| `npm test` (app vitest) | ✅ 21/21 |
| `packages/sdk` vitest | ✅ 11/11 |
| `smoke:agent-stellar` | ✅ create + balance + Lab links |
| `smoke:stellar` | ❌ Edge still on legacy contract ID + XDR skew (`Bad union switch`) until `pay` redeploy |
| Frontend Vercel | ✅ https://paysmith-eight.vercel.app (`/stellar` shows v3 ID) |

**Honesty:** testnet only · not pen-tested · OZ Relayer = SDK scaffold until hosted.

### One ops step before stage (Edge)

Local `SUPABASE_ACCESS_TOKEN` is invalid. After a fresh PAT from https://supabase.com/dashboard/account/tokens:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_…"   # fresh PAT
npx supabase secrets set STELLAR_SOROBAN_POLICY_CONTRACT_ID=CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW --project-ref hkngxtrqhnkzkbqgqbjk
npx supabase functions deploy pay --project-ref hkngxtrqhnkzkbqgqbjk --no-verify-jwt
npm run smoke:stellar
```

Until then: demo Lab + Freighter + on-chain `try_spend` explorer link (policy proof is live on-chain).

---

## Before you walk on stage

1. Fill **3–5 team members** on the Google form (solo not allowed)  
2. Record ≤3 min Loom backup  
3. Open Freighter on phone/laptop on **testnet** at `/stellar`  
4. Have Lab + explorer tabs ready  
5. One-liner: *“Policy-bound agent wallets — MoMo sandboxes + Stellar USDC/XLM — for Africa AI builders.”*

---

## 30-day Instaward north-star (checkable)

See `memory/INSTAWARD_30_DAY_PLAN.md` — Relayer fee-bump spike, SDK→17.x, ≥10 USDC settles, waitlist/traction, threat-model refresh, Loom.
