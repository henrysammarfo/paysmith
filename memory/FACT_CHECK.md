# Paysmith — Fact Check

**Last verified:** 2026-08-24 (T2 launch + npm smoke + engineering polish)

## Verified product / rails

| Claim | Verdict | Source |
|-------|---------|--------|
| Paystack / Flutterwave / Stellar XLM+USDC settle | ✅ | `test:gate` smokes |
| Concurrent Idempotency-Key → 1 debit | ✅ | `smoke:stress` |
| Soroban spending-policy on testnet | ✅ | `CAOJF27FUDJB3IAH27QYDE6HVLKC7R7VCUBAZ64Y3VLKIQDQ2WTMW5ZY` |
| Soroban `try_spend` on-chain | ✅ 2026-08-24 | `CAHFJKHA7O75475ZI4Y4C6W6PIAR5MZUSNDKPNKADJ7KEHR7XNSTGMBE` |
| `@paysmithhq/mcp` full MCP SDK | ✅ 0.2.3 npm | `@modelcontextprotocol/sdk` |
| T2 waitlist + community packs | ✅ | Landing + `BUILDER_CIRCLE_NG.md` + thread draft |
| Partna + Stellar | ❌ | No Stellar in Partna OpenAPI |
| Daraja / MTN MoMo integrated | ❌ | Research only `RAILS_DARAJA_MTN.md` |
| Unhackable / pen-test complete | ❌ | `docs/PEN_TEST_STATUS.md` |
| Mainnet live corridors | ❌ | Testnet + PSP sandboxes |

## Live traction (2026-08-24)

Waitlist **0** · wallets **21** · txs **34** · Stellar settles **7** (`TRACTION_LIVE.json`)

## Residual risks

1. Old contract `CAOJF27…` superseded by v2 deploy — use new ID in secrets
2. Off-chain ledger pre-check before on-chain `try_spend` — not single atomic flow
3. In-memory rate limits; CORS `*`; no external pen test
4. Rail + ledger not one atomic DB txn — reconcile + idempotency

## Growth (2026-08-31)
God of Prompt marketing/SEO/sales patterns adapted in `memory/GROWTH_WAITLIST_100.md`. Research via Tavily+WebFetch; TinyFish unavailable (no key in .env).

## Stellar 14 (2026-10-17)
- Demo Day form pack + Freighter page + Soroban policy admin/set_wallet_policy in source.
- Ecosystem tools researched in `docs/STELLAR14_ECOSYSTEM.md`.
- Contract ID (deployed): `CAHFJKHA7O75475ZI4Y4C6W6PIAR5MZUSNDKPNKADJ7KEHR7XNSTGMBE` — redeploy wasm for v3 funcs when CLI available.
