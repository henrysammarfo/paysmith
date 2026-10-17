# Stellar 14 — Ecosystem integration map (Paysmith)

**Research date:** 2026-10-17 (Tavily + developers.stellar.org)  
**Program window judged:** 5–17 October 2026

## What we adopted

| Tool / OSS | Status in Paysmith | Notes |
|------------|-------------------|--------|
| **Soroban spending-policy** | ✅ Live testnet | `try_spend`, `get_spent`, `check_spend`, **+** `init_admin`, `set_wallet_policy`, `get_wallet_policy` |
| **@stellar/stellar-sdk** (Horizon + RPC) | ✅ Edge `/pay` | Horizon USDC/XLM settle; Soroban RPC for policy |
| **Freighter** | ✅ `/stellar` demo page | Connect pubkey on testnet for Demo Day |
| **Stellar Lab** | ✅ Linked | Contract explorer for policy ID |
| **Stellar CLI** | ✅ `npm run deploy:soroban` | Deploy/redeploy wasm |
| **OpenZeppelin Stellar Contracts** | 📋 Mapped | Future: reuse `stellar-access` patterns for admin; we mirrored admin + policy storage |
| **OpenZeppelin Relayer / Channels** | 📋 Roadmap | Fee-bump + sequence isolation for treasury (replaces shared-secret race) |
| **Smart Account Kit** | 📋 Roadmap | Passkey agent wallets with on-chain spending policies |
| **Stellar Raven MCP + Skills** | 📋 Align | Paysmith already ships `@paysmithhq/mcp`; complement with SDF Raven |
| **Anchor Platform / SEPs** | 📋 Spike | SEP-24 offramp later; sandbox fiat via Paystack/Flutterwave today |
| **Scaffold Stellar** | 📋 Optional | Frontend scaffold for contract UIs |

## Software versions (SDF docs, Protocol ~29)

- Stellar JS SDK: **v17.2.1** (target upgrade from Edge pin `@13.1.0`)
- Soroban Rust SDK: **28.0.0** (we ship on `22.0.0` today — upgrade when CI has Rust toolchain)
- Stellar CLI: **28.1.0**

## Contract ID (testnet)

`CAHFJKHA7O75475ZI4Y4C6W6PIAR5MZUSNDKPNKADJ7KEHR7XNSTGMBE`

## Honest gaps (judges)

- Not mainnet · not pen-tested · OZ Relayer not wired yet · SDK Edge still on stellar-sdk 13 pin for Deno stability
- Demo Day commits dated **2026-10-17** for Stellar 14 window; product existed before 5 Oct
