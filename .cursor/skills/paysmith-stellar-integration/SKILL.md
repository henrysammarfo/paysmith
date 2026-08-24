---
name: paysmith-stellar-integration
description: Implements Stellar Horizon USDC settlement, Soroban spending policies, and SEP anchor integration for Paysmith. Use when building Stellar features, Soroban contracts, wallet connect, or preparing SCF/accelerator submissions for Paysmith.
---

# Paysmith Stellar Integration

## Current state

Read `memory/CURRENT_STATE.md` first. **Horizon XLM + USDC settle on `/pay` (testnet).**  
**Soroban spending-policy deployed testnet:** `CAOJF27FUDJB3IAH27QYDE6HVLKC7R7VCUBAZ64Y3VLKIQDQ2WTMW5ZY` (`memory/SOROBAN_DEPLOY.json`). Edge env `STELLAR_SOROBAN_POLICY_CONTRACT_ID` set; `/pay` returns it. Policy still enforced off-chain.

## Implementation order

### Phase 1 — Horizon USDC (testnet) ✅
### Phase 2 — Soroban spending policy ✅ deployed

1. Scaffold + `check_spend` ✅
2. Deploy testnet + Edge secret ✅
3. Optional: invoke from `/pay` via RPC before Horizon (next hardening)
4. `stellar contract build` via MSYS2 MinGW on Windows

### Phase 3 — Anchors & wallets
(unchanged)

## Verification checklist

```
- [x] Testnet tx hash visible in dashboard
- [x] Soroban contract deployed + FACT_CHECK
- [ ] Edge RPC invoke of check_spend on every pay (optional)
```

## Do not claim

Unhackable or pen-test complete without external report.
