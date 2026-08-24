# Traction checklist (T2 live)

**Updated:** 2026-08-24 — counts from live DB (`memory/TRACTION_LIVE.json`)

## Live metrics

| Metric | Target (T3) | Live (2026-08-24) | Phase |
|--------|-------------|---------------------|-------|
| Waitlist signups | ≥100 | **0** | T2 launch — promote now |
| Agent wallets | growing | **21** | T3 |
| Sandbox settles (tx rows) | ≥50 | **34** | T3 |
| Stellar testnet txs | ≥20 | **7** | T3 |
| npm SDK smoke | PASS | ✅ `smoke:npm` 2026-08-24 | T2 |

## T2 status (2026-08-24)

| Action | Status |
|--------|--------|
| Waitlist form live on landing | ✅ `CtaSection` |
| Builder Circle NG pack | ✅ `memory/BUILDER_CIRCLE_NG.md` |
| Instaward sprint pack | ✅ `memory/INSTAWARD_SPRINT.md` |
| Community thread draft | ✅ `memory/SCF_DEMO_THREAD.md` |
| npm agent tools | ✅ sdk/cli/mcp on registry |

## Sequence

1. **T2** — Waitlist + Builder Circle + Ghana chapter (now)
2. **T3** — Beta cohort + waitlist ≥100
3. **T4** — Instaward / SCF Build #46

## Before posting thread

1. `npm run test:gate` + `npm run smoke:npm`
2. Update `memory/FACT_CHECK.md`
3. Replace `[landing URL]` in `SCF_DEMO_THREAD.md`
4. Re-run `npm run traction:query` — cite live counts only

## Research (not integrated)

- Daraja / MTN Open API: `memory/RAILS_DARAJA_MTN.md`
