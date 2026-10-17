# Paysmith — Soroban spending policy

**Status:** Testnet · Stellar 14 upgrade 2026-10-17

| | |
|--|--|
| Contract ID | `CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW` |
| Network | **testnet** |
| Lab | [Contract explorer](https://lab.stellar.org/r/testnet/contract/CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW) |
| Wasm hash | `f3870fa4612ce74276379d21345159e3ba8a826175b0219a9f9eef39c5439e9c` |

## Functions

| Fn | Purpose |
|----|---------|
| `try_spend(wallet_id, policy, amount, day)` | **Authoritative** — persists daily spend; respects stored wallet policy |
| `get_spent(wallet_id, day)` | Read on-chain total |
| `check_spend(policy, amount, spent_today)` | Legacy simulate-only |
| `init_admin(admin)` | One-time admin bootstrap |
| `set_wallet_policy(wallet_id, policy)` | Store per-wallet caps (admin-gated when set) |
| `get_wallet_policy(wallet_id)` | Read stored policy override |

## Events

- `spend` — `(amount, new_spent, daily_limit)` keyed by wallet + day  
- `setpol` — policy rotation  
- `admin` — admin init  

## Redeploy

```powershell
npm run deploy:soroban
# Update STELLAR_SOROBAN_POLICY_CONTRACT_ID in Edge secrets
npx supabase functions deploy pay --project-ref hkngxtrqhnkzkbqgqbjk --no-verify-jwt
```

## Ecosystem notes

See `docs/STELLAR14_ECOSYSTEM.md` — Freighter demo at `/stellar`, OpenZeppelin Relayer / Smart Account Kit on roadmap.
