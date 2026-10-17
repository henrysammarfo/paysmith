# OpenZeppelin Relayer + Smart Account Kit (Paysmith)

**Status:** SDK scaffolds shipped · production hosting = Instaward Week 2–3  
**Honesty:** Not mainnet. Not a substitute for pen test.

## Why judges care

Funded Africa SCF projects win on **reliable settlement**. Paysmith’s treasury today signs Horizon payments with a shared secret — sequence races under concurrency are a real residual risk (`docs/THREAT_MODEL.md`). OZ Relayer / Channels isolates fee-bump + sequencing. Smart Account Kit adds passkey-bound agent operators with on-chain policies that mirror our Soroban `set_wallet_policy`.

## What shipped (2026-10-17)

| Piece | Location | Behavior |
|-------|----------|----------|
| Relayer client | `@paysmithhq/sdk` → `OpenZeppelinRelayerClient` | Scaffold until `PAYSMITH_OZ_RELAYER_URL` + `API_KEY` set |
| Smart Account scaffold | `smartAccountKitScaffold()` | `status: scaffold \| ready` when wasm hash + verifier set |
| Soroban policy | `contracts/spending-policy` | `init_admin`, `set_wallet_policy`, `try_spend` (SDK 29) |
| Freighter UI | `/stellar` | Connect testnet pubkey for Demo Day |

## Env template

```bash
# Optional — enable Relayer submit path
PAYSMITH_OZ_RELAYER_URL=https://your-oz-relayer.example
PAYSMITH_OZ_RELAYER_API_KEY=

# Optional — Smart Account Kit (after OZ account wasm deploy)
PAYSMITH_SMART_ACCOUNT_WASM_HASH=
PAYSMITH_WEBAUTHN_VERIFIER=
```

## 30-day checkable exit

1. One fee-bumped testnet tx via Relayer **or** written blocker log with SDF Discord ask  
2. Smart Account Kit README + env placeholders filled from a spike deploy  
3. `npm run smoke:agent-stellar` + `smoke:stellar` green  

## References

- https://docs.openzeppelin.com/relayer  
- https://github.com/stellar/smart-account-kit  
- `memory/INSTAWARD_30_DAY_PLAN.md`
