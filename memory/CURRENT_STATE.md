# Paysmith — Current State

**Last updated:** 2026-10-17 (launch checklist + Stellar 14)  
**Supabase:** `hkngxtrqhnkzkbqgqbjk`  
**Launch checklist:** `memory/LAUNCH_CHECKLIST_20.md` (20/20 addressed)

## Verified now
- Rails: Paystack, Flutterwave, Stellar, Daraja (KES), MTN MoMo (sandbox)
- Soroban spending-policy **v3** testnet: `CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW` (SDK 29)
  - Fns: `try_spend`, `get_spent`, `check_spend`, `init_admin`, `set_wallet_policy`, `get_wallet_policy`
  - On-chain `try_spend` proof: tx `176706a7…1440a7d`
- Freighter demo: `/stellar`
- SDK: Stellar helpers + Smart Account scaffold + OZ Relayer client
- npm: sdk/cli/mcp · waitlist Resend via `paysmith@tryopal.asia`
- Demo Day: `memory/STELLAR14_FINAL_SUBMISSION.md` · form `memory/STELLAR14_DEMO_DAY_FORM.md`
- Tests: cargo 4/4 · vitest app 21 · sdk 11 · `smoke:agent-stellar` PASS

## You next (Demo Day stage)
1. Fill **3–5 team members** on Google form (no solo)  
2. `npx supabase login` → set `STELLAR_SOROBAN_POLICY_CONTRACT_ID` + `functions deploy pay` (CLI token expired; Edge remaps legacy IDs in code until redeploy)  
3. Record 3-min Loom backup  
4. Submit form · Payaza Labone 12–3pm GMT

## Honest residuals
- Pen test not done · not mainnet  
- Edge `/pay` pin `@stellar/stellar-sdk@14.2.0` (17.x = Instaward Week 2)  
- OZ Relayer / Smart Account = SDK scaffolds, not hosted production  
- Supabase management token in `.env` invalid for secrets CLI  
- MTN sandbox EUR quirk · Daraja/MTN pending until callback
