# Paysmith — Payment Rails & Partner Stack

**Updated:** 2026-08-23  
**Decision:** Chimoney **removed**. Fiat = Paystack (primary) + Flutterwave (secondary). Crypto = Stellar Horizon (XLM + USDC verified). Offramp partner spike = Partna (P6, not wired).

**Flutterwave:** See `memory/FLUTTERWAVE.md` — Transfer via API + IP whitelist. **Settle PASS** after enable (2026-08-23).

## Target architecture

```
Agent POST /pay
  ├─ method mobile_money | bank_transfer → Paystack (prefer) → Flutterwave fallback
  ├─ method crypto / currency USDC|XLM → Stellar Horizon (treasury) + stellar_tx_hash
  └─ optional offramp USDC→NGN/GHS → Partna (P6 spike; verify Stellar network) or SEP-24 anchor
Ledger: debit after rail; ledger_debited_at + reconcile-ledger cron if debit fails
Idempotency-Key replays stored response (including 500 debit-fail) to avoid double rail
```

## Env keys needed

| Key | Purpose | Status |
|-----|---------|--------|
| `PAYSTACK_SECRET_KEY` | Fiat transfers (NG/GH) | ✅ Test live |
| `FLUTTERWAVE_SECRET_KEY` | Fiat backup | ✅ Settle PASS |
| `STELLAR_TREASURY_SECRET` | XLM/USDC payouts | ✅ Testnet |
| `STELLAR_NETWORK` | `testnet` \| `mainnet` | Default testnet |
| `PARTNA_API_KEY` / `PARTNA_API_USER` | Stablecoin ramp | ⚠️ Spike only — see `memory/PARTNA.md` |
| `WEBHOOK_INTERNAL_SECRET` | webhook-deliver + reconcile cron | ✅ |

## Partner evaluation scorecard (next calls)

| Partner | Africa | Stellar | API maturity | KYB pain | Action |
|---------|--------|---------|--------------|----------|--------|
| Paystack | ✅ NG/GH | ❌ | Excellent sandbox | Low | **Integrate now** |
| Flutterwave | ✅ | ❌ | Good | Low | Keep hardened |
| Partna | ✅ | Via USDC | Strong docs | Med | Spike next |
| Planbok | ✅ | Extending | Docs live | Med | Partner conversation |
| Busha | ✅ NG | ⚠️ verify | Business API | Med | Spike |
| Quidax | ✅ | ⚠️ builders say weak | Business API | **High** | Deprioritize |
| Yellow Card | ✅ | ✅ USDC | Enterprise | High | Mid-term |
| MoneyGram | Global | ✅ | Partner portal | High | SCF Integration |
| Link NGNC | NG | ✅ native | Business | Med | Path payments R&D |
| Pollar | LATAM-first | ✅ | SDK | Low for LATAM | Only if Africa expands |
| CowryPay / KoboX | Apps | Partial | Consumer | N/A | UX research only |

## Builder-circle notes (user-supplied, 2026)

- NGN Stellar offramp still a pain point — community asking for real SEP-24/31 rails
- Quidax KYB heavy; spreads OK; Stellar support doubtful
- Pollar suggested for wallet+KYC (verify Africa)
- Planbok pitching as BaaS + own anchor — competitor and potential vendor
- KoboX / CowryPay shared as live NG products to study
