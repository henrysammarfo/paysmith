# Paysmith Threat Model (draft)

**Updated:** 2026-08-23  
**Scope:** Sandbox / Stellar **testnet** stack (Supabase Edge + Paystack + Flutterwave + Horizon + Soroban policy).  
**Not:** External pen-test. Do **not** claim unhackable. See `docs/PEN_TEST_STATUS.md`.

## Assets

| Asset | Sensitivity |
|-------|-------------|
| Developer API keys (`ps_test_` / live) | High — spend authority |
| Ledger balances (`balance_*`) | High — economic truth in DB |
| `STELLAR_TREASURY_SECRET` | Critical — on-chain funds + Soroban simulate source |
| Paystack / Flutterwave secrets | Critical — PSP disbursement |
| Webhook signing / internal secrets | High |
| Service-role JWT | Critical — bypasses RLS |
| Soroban policy contract ID | Medium — public on testnet; integrity of invoke path matters |

## Threats & controls

### 1. API key theft
- **Controls:** Rate limits; KYC/KYB ceilings; key rotation; live keys need KYB approved.
- **Residual:** In-memory rate limits reset on cold start; no hardware-bound keys.

### 2. Webhook spoofing
- **Controls:** `webhook-deliver` requires service-role or internal secret; outbound HMAC for developers.
- **Residual:** Developers must verify HMAC.

### 3. Balance manipulation / double-spend
- **Controls:** Debit after rail accept; fail-closed on debit error; Idempotency-Key + table; concurrent stress smoke; RLS.
- **Residual:** Rail call and SQL debit are not one atomic DB transaction — `reconcile-ledger` + cron.

### 4. Policy bypass
- **Controls:** Off-chain caps on `/pay`; **Soroban `check_spend` simulate** when `STELLAR_SOROBAN_POLICY_CONTRACT_ID` set (fail-closed on deny / RPC error unless `STELLAR_SOROBAN_SOFT_FAIL=1`).
- **Residual:** Simulation ≠ consensus finality for state-changing policies; current contract is pure check (no persistent spent_today storage on-chain yet). Off-chain spent_today still source of truth for daily totals.

### 5. Stellar treasury compromise
- **Controls:** Secret only in Edge; testnet treasury; small balances.
- **Residual:** Mainnet needs HSM / multi-sig / ops runbooks (T5).

### 6. Admin abuse
- **Controls:** `admin_audit_log` on role changes.
- **Residual:** Service-role bypasses RLS.

### 7. Compliance / marketing risk (Ghana VASP Act 1154)
- **Controls:** Honest positioning as **developer sandbox + PSP-partner rails**; no “licensed VASP” or retail crypto ads (BoG–SEC advertising constraints 2026).
- **Residual:** Counsel required before live corridors / consumer crypto claims.

## Stellar security alignment (research 2026-08-23)

Documented in `memory/RESEARCH_AGENT_RAILS.md`:
- Keep keys server-side; testnet first; fail-closed rails; document residual risk.
- Prefer SEP/partner ramps over inventing custody narratives.

## Out of scope (for now)

- Nation-state APT, supply-chain npm compromise
- Full BoG PSP / VASP licensing (see `memory/COMPLIANCE.md`)
- External audit / bug bounty

## Required tests before production

- [x] Paystack / Flutterwave / Stellar XLM / USDC smokes  
- [x] Webhook / reconcile unauth → 401  
- [x] Policy / KYC over-limit → 403  
- [x] RLS isolation  
- [x] Reconcile + cron  
- [x] Admin audit  
- [x] Concurrent idempotency stress  
- [x] Soroban contract deploy + invoke smoke  
- [ ] External pen test  
- [ ] Mainnet treasury ops  

## References

- `memory/FACT_CHECK.md`, `memory/COMPLIANCE.md`, `memory/RESEARCH_AGENT_RAILS.md`
- `docs/NPM_PUBLISH_SETUP.md`
- Workspace rule: paysmith security
