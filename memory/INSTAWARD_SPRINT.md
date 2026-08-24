# Paysmith — Instaward 30-day sprint (P5)

**For:** Stellar Ghana Ambassador Chapter · **Updated:** 2026-08-23  
**Rule:** Engage chapter lead before claiming Instaward; scope must match shipped code (`memory/FACT_CHECK.md`).

## One-liner

AI agent wallets that pay **GHS/NGN MoMo + bank** (Paystack/Flutterwave) and settle **USDC on Stellar testnet** — compliance caps, idempotency, reconcile worker.

## Sprint scope (30 days) — evidence already in repo

| Week | Deliverable | Evidence |
|------|-------------|----------|
| 1 | Paystack GH MoMo + ledger debit | `npm run smoke:paystack` · tx + balance |
| 2 | Stellar XLM + USDC Horizon settle | `smoke:stellar` · `smoke:stellar-usdc` · explorer hashes |
| 3 | Security gates | RLS · webhook/reconcile 401 · admin audit · reconcile cron |
| 4 | Demo pack for chapter | GitHub + 2-min screen recording + waitlist link |

## Demo script (2 min)

1. `npm i @paysmithhq/sdk` → `createAgent` + `pay` with `newIdempotencyKey()`
2. `npx paysmith wallets` → live sandbox wallets
3. `POST /pay` GHS MoMo → Paystack reference
4. `POST /pay` USDC → Stellar hash on stellar.expert
5. CTA: waitlist on landing (T2 live)

## Metrics to report chapter (honest)

- Sandbox settles: Paystack, Flutterwave, Stellar XLM/USDC (counts from smoke logs / dashboard)
- Unique agent wallets created
- Waitlist signups (from `waitlist_signups` — do not invent count)
- GitHub public + threat model draft

## Not in this sprint (defer to Build / P6+)

- Soroban mainnet policy enforcement (scaffold only: `contracts/spending-policy/`)
- Partna offramp (spike: `memory/PARTNA.md`)
- MoneyGram / live KYB corridors
- Marketing thread (saved for after engineering sign-off)

## Chapter ask

- Instaward **$1k–$5k** XLM for testnet MVP + Ghana MoMo narrative
- Intro to SCF Build **Integration** track (MoneyGram/Bridge + Paystack fiat last-mile)
- Referral code if available

## Links

- Handbook: `memory/SCF_HANDBOOK.md`
- Threat model: `docs/THREAT_MODEL.md`
- Supabase project: `hkngxtrqhnkzkbqgqbjk`
