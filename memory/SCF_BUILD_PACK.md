# SCF Build — interest form pack (P10 prep)

**Verified deadline (communityfund.stellar.org):** SCF **#46 Build submit Nov 8, 2026** — re-check before submit.  
**Path:** Interest form → invite → full Build proposal (not open submit).

## One-line

Paysmith: **API for AI agent wallets** — Paystack/Flutterwave MoMo + bank in GH/NG/KE, **USDC on Stellar testnet**, spending caps, idempotency, reconcile worker.

## Track recommendation

**Integration** — compose Paystack (fiat last-mile) + Stellar Horizon USDC + (roadmap) MoneyGram SEP-24 / Bridge.

Alternative **Open** if emphasizing novel agent-wallet category in Africa.

## Evidence to attach (GitHub + smokes)

- `npm run smoke:paystack` · `smoke:flutterwave` · `smoke:stellar` · `smoke:stellar-usdc`
- `smoke:rls` · `smoke:reconcile` · `smoke:admin-audit` · `smoke:agents-create`
- `docs/THREAT_MODEL.md` (Tranche #2 draft)
- Explorer hashes in `memory/SMOKE_*.json`
- `contracts/spending-policy/` Soroban scaffold

## Traction (fill live — do not invent)

| Metric | Source |
|--------|--------|
| Waitlist signups | `waitlist_signups` count |
| Agent wallets created | `agent_wallets` count |
| Sandbox settles | smoke logs + dashboard |
| Stellar testnet txs | stellar.expert links |

## Budget sketch (4 tranches)

| Tranche | % | Deliverable |
|---------|---|-------------|
| #0 | 10% | Award acceptance |
| #1 | 20% | MVP — current smokes + Instaward demo |
| #2 | 30% | Testnet hardening + threat model + Soroban deploy |
| #3 | 40% | Mainnet pilot corridor (1 country, KYB) |

## Referral

Ask Stellar Ghana chapter / prior SCF alumni for referrer code (weighted in review).

## Action

1. Submit interest at [communityfund.stellar.org](https://communityfund.stellar.org) — **Indicate Your Interest**
2. Parallel: Instaward via chapter (`memory/INSTAWARD_SPRINT.md`)
3. After invite: full proposal using this pack + `memory/SCF_HANDBOOK.md`
