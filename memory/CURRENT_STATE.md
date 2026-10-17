# Paysmith — Current State

**Last updated:** 2026-10-17 (Stellar 14 Demo Day pack)  
**Supabase:** `hkngxtrqhnkzkbqgqbjk`

## Verified now
- Rails: Paystack, Flutterwave, Stellar, Daraja (KES), MTN MoMo (sandbox)
- Soroban spending-policy: `try_spend` / `get_spent` / `check_spend` + **admin + set_wallet_policy** (source upgrade 2026-10-17)
- Freighter demo: `/stellar`
- npm: sdk/cli/mcp · waitlist Resend via `paysmith@tryopal.asia`
- Demo Day form: `memory/STELLAR14_DEMO_DAY_FORM.md`

## You next (Demo Day)
1. **Make repo public** + fill 3–5 team members on the Google form  
2. Redeploy Soroban wasm if Rust toolchain available (`npm run deploy:soroban`)  
3. Record 3-min Loom backup  
4. Submit form · show up Payaza Labone 12–3pm GMT

## Honest residuals
- Pen test not done · not mainnet  
- Edge still pins `@stellar/stellar-sdk@13.1.0` (upgrade to 17.x planned)  
- OZ Relayer / Smart Account Kit not wired yet (documented roadmap)  
- MTN sandbox EUR quirk · Daraja/MTN pending until callback
