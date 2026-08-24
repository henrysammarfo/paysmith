# Paysmith — Soroban spending policy

**Status:** Testnet deploy 2026-08-23 · **v2 wasm** adds on-chain `try_spend` (2026-08-24, redeploy pending)

| | |
|--|--|
| Contract ID (current) | `CAOJF27FUDJB3IAH27QYDE6HVLKC7R7VCUBAZ64Y3VLKIQDQ2WTMW5ZY` |
| Lab | https://lab.stellar.org/r/testnet/contract/CAOJF27FUDJB3IAH27QYDE6HVLKC7R7VCUBAZ64Y3VLKIQDQ2WTMW5ZY |

## Functions

| Fn | Purpose |
|----|---------|
| `try_spend(wallet_id, policy, amount, day)` | **Authoritative** — persists daily spend on-chain |
| `get_spent(wallet_id, day)` | Read on-chain total |
| `check_spend(policy, amount, spent_today)` | Legacy simulate-only |

Edge `/pay` calls `try_spend` (submit tx) when contract ID set. Set `STELLAR_SOROBAN_SIMULATE_ONLY=1` to force legacy simulate path.

## Redeploy

```powershell
npm run deploy:soroban
# Update STELLAR_SOROBAN_POLICY_CONTRACT_ID in Edge secrets
supabase functions deploy pay
```
