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
| **OpenZeppelin Stellar Contracts** | ✅ Patterned | Admin + `set_wallet_policy` mirrors access-control style (not vendored OZ wasm) |
| **OpenZeppelin Relayer / Channels** | ✅ SDK scaffold | `OpenZeppelinRelayerClient` — host Week 2 (`docs/OZ_RELAYER_SMART_ACCOUNT.md`) |
| **Smart Account Kit** | ✅ SDK scaffold | `smartAccountKitScaffold()` — passkey = Instaward Week 2–3 |
| **Stellar Raven MCP + Skills** | ✅ Align | Ships `@paysmithhq/mcp`; complement SDF Raven in sprint |
| **Anchor Platform / SEPs** | 📋 Spike | SEP-24 offramp later; sandbox fiat via Paystack/Flutterwave today |
| **Scaffold Stellar** | 📋 Optional | Frontend scaffold for contract UIs |

## Software versions (SDF docs, Protocol ~29)

- Stellar JS SDK: **v17.x** app / Edge `/pay` pinned **`@stellar/stellar-sdk@14.2.0`** (17.x next Instaward week)
- Soroban Rust SDK: **29.0.1** (contract)
- Stellar CLI: **27.1.0** (local)

## Contract ID (testnet, redeployed 2026-10-17)

`CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW`  
Wasm hash: `f3870fa4612ce74276379d21345159e3ba8a826175b0219a9f9eef39c5439e9c`  
Lab: https://lab.stellar.org/r/testnet/contract/CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW  
Previous: `CAHFJKHA7O75475ZI4Y4C6W6PIAR5MZUSNDKPNKADJ7KEHR7XNSTGMBE`

## Honest gaps (judges)

- Not mainnet · not pen-tested · OZ Relayer / Smart Account = SDK scaffolds (`docs/OZ_RELAYER_SMART_ACCOUNT.md`), not hosted production
- Demo Day commits dated **2026-10-17** for Stellar 14 window; product existed before 5 Oct
