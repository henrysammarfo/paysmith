# Paysmith Session Log

## 2026-08-22 — Build kickoff P0.3–P1

- Added `docs/API_KEYS_SETUP.md` (user fill → paste)
- `.env.example` + `.gitignore` now ignores `.env`
- Horizon settlement live in `pay/index.ts` (XLM + USDC w/ issuer env)
- Migration `20260822180000_stellar_and_kyc_tiers.sql`
- Script `scripts/generate-stellar-testnet.mjs` — testnet treasury generated & Friendbot-funded
- Waiting on user: Paystack `sk_test_` + Supabase Edge secrets + run migration

---

## 2026-08-22 — TinyFish + competitive overview (pre-build)

**TinyFish key:** validated (`sk-tinyfish-…`) via Fetch API.

**Fetched:** Planbok docs, Partna intro (NGN/KES live, **GHS launching**), CowryPay, MoneyGram Ramps, Bridge, Pollar, AgentLux agent-wallet essay.

**Verdict:** No category leader for “Stripe for AI agents → Africa MoMo + Stellar.” Global agent stack (Stripe/Crossmint/Skyfire) ignores MoMo; Africa rails ignore agent policies.

**Artifacts:** `memory/ROADMAP.md` (P0.1–P10), `memory/COMPLIANCE.md`.

**Partner stance:** Day-one = Paystack + Stellar testnet; peer = Planbok/Partna; enterprise MoneyGram/Bridge after traction.

---

## 2026-08-22 — Deep research + rails pivot (Chimoney out)

**Research (live):**
- SCF Handbook 7.0 (GitBook): Build tracks, Instawards $1k–$5k / $15k cap, Integration List (MoneyGram, Bridge, SDP, Freighter, …)
- Competitors: Planbok, CowryPay, KoboX, Pollar, Partna, NGNC/Link, Busha, Quidax (builder-circle notes)
- Ghana wedge documented vs Nigeria-heavy SCF awards

**Code:**
- Removed Chimoney from `/pay` router
- Added Paystack transfer + recipient flow; Flutterwave kept as backup
- Crypto/USDC fails closed until Stellar Horizon SDK (no fake settle)
- Ledger debit on successful pay
- `webhook-deliver` requires service-role JWT or `WEBHOOK_INTERNAL_SECRET`

**Memory added:** `SCF_HANDBOOK.md`, `COMPETITORS.md`, `RAILS_AND_PARTNERS.md`

**Still waiting:** TinyFish API key (user said they will drop it)

---

## 2026-08-22 — Full audit (Stellar + Paysmith focus)

**Scope:** Architecture audit, live funding research (Tavily), memory/rules/skills creation.

### Findings

- Paysmith is a polished Supabase fintech MVP; Stellar integration is marketing-only (2 UI badges).
- USDC is a Postgres column routed via Chimoney mobile-money API, not on-chain Stellar USDC.
- Critical security: `webhook-deliver` has no inbound auth.
- Critical logic: `/pay` does not update wallet balances.
- Tests: placeholder only; Playwright config exists with zero spec files.
- CI: none in repo.
- Competitors on Stellar for Africa payments: Afripay, AnchorFX, Kutana, JoonaPay, Wirex/Ultra Stellar agent infra.

### Research performed

- Tavily API: Stellar x CV Labs Accelerator, SCF rounds, Africa fintech VCs, Soroban ecosystem.
- Stellar Community Fund site fetched live.
- fundsforNGOs Stellar x CV Labs page fetched live (deadline listed as 03-Jul-2026).

### Artifacts created

- `memory/CURRENT_STATE.md`
- `memory/FACT_CHECK.md`
- `memory/OPPORTUNITIES.md`
- `memory/AUDIT_REPORT.md`
- `.cursor/rules/paysmith-stellar.mdc`
- `.cursor/rules/paysmith-security.mdc`
- `.cursor/skills/paysmith-stellar-integration/SKILL.md`
- `.cursor/skills/paysmith-funding-research/SKILL.md`

### API keys note

- Tavily key used successfully for live research.
- TinyFish key provided by user was invalid (prompt text pasted, not an API key).

## 2026-08-23 — Supabase connect / deploy attempt

- Wrote local `.env` for project `hkngxtrqhnkzkbqgqbjk` (Paystack + Flutterwave test + Stellar treasury + Supabase JWTs).
- Paystack test key probe: HTTP 200.
- `config.toml` project_id = `hkngxtrqhnkzkbqgqbjk`.
- Prepared `.env.edge-secrets` + `scripts/deploy-supabase.ps1`.
- **Blocked:** CLI needs `SUPABASE_ACCESS_TOKEN` (`sbp_…` from Account → Access Tokens). Service role JWT cannot link/secrets/deploy.
- Not yet done: secrets set, db push, functions deploy.

## 2026-08-23 — Deploy complete

- Linked `hkngxtrqhnkzkbqgqbjk`; set 6 edge secrets; deployed pay / agents-create / agents-balance / webhook-deliver / track-api-call.
- `db push` initially failed (schema already present); repaired 8 old migrations as applied; pushed `20260822180000_stellar_and_kyc_tiers`.
- Next: Paystack sandbox E2E smoke; rotate CLI access token pasted in chat.

## 2026-08-23 — Paystack sandbox smoke

- Fixed MoMo recipient to use `bank_code` (MTN); surface Paystack error detail on 502.
- Redeployed `pay`. Script: `scripts/smoke-paystack.mjs` → `memory/SMOKE_PAYSTACK.json`.
- Results: auth+wallet+ledger OK; Paystack transfer reached; rail failed `insufficient_balance` (Paystack GHS=0); ledger **not** debited on fail.
- Unblock full settle: top up Paystack test balance (Dashboard → Balance) then re-run smoke.

## 2026-08-23 — Paystack full settle smoke PASS

- Paystack GHS top-up visible (200000 pesewas).
- `/pay` MoMo returned 200, `TRF_s6yto2rwzlor2u2p`, status pending.
- Fixed silent debit bug: update used missing `total_volume`/`total_txns`; now only `balance_*` + error if debit fails.
- Ledger 25 → 24 GHS after smoke.

## 2026-08-23 — Stellar testnet smoke PASS

- Redeployed `pay` with npm:@stellar/stellar-sdk + errorDetail; refreshed STELLAR_* edge secrets.
- Smoke `scripts/smoke-stellar.mjs`: XLM 0.5 settled, ledger 10→9.5.
- Tx: 5173f51b6e107107c8e8ff980098ef15374f9ee7af2860e4ee78cc554b37be71
- Explorer: https://stellar.expert/explorer/testnet/tx/5173f51b6e107107c8e8ff980098ef15374f9ee7af2860e4ee78cc554b37be71

## 2026-08-23 — Waitlist + CI

- Migration `waitlist_signups` applied; landing `CtaSection` email + corridor form.
- `.github/workflows/ci.yml`: npm test + build; optional webhook 401 when SUPABASE_URL secret set.
- `scripts/ci-smoke-gate.mjs` PASS locally (webhook 401). Vitest: ledger-policy + example (3 tests).
- Scripts: `npm run smoke:ci` | `smoke:paystack` | `smoke:stellar`.

## 2026-08-23 — No GitHub Actions

- Removed `.github/workflows/ci.yml` (Actions disabled / no billing).
- Keep local gates only: `npm test`, `npm run smoke:ci` (+ paystack/stellar smokes).

## 2026-08-23 — KYC/KYB ceilings + idempotency

- `/pay` clamps limits by KYC (tier0/1/2) × KYB (sandbox/standard/enhanced); live keys need kyb_status=approved.
- Over-limit → 403 (verified: amount 500 / tier0 → limit 200).
- `Idempotency-Key` + table `pay_idempotency`; replay returns same tx, one ledger debit (verified XLM 5→4.9).
- Docs updated; vitest `kyc-ceilings.test.ts`. Deployed `pay` + migration.

## 2026-08-23 — Flutterwave failover + Chimoney cleanup

- Failover: Paystack `failed` → Flutterwave; test-only `preferRail: "flutterwave"`.
- Chimoney edge secrets unset (API_KEY, APP_ID, TEAM_ID).
- Smoke hit Flutterwave but blocked: **IP Whitelisting** required on Flutterwave dashboard for transfers.
- Path PASS (provider=flutterwave, ledger not debited on fail). Full settle needs whitelist allow-all (test) or Supabase egress IPs.
- `npm run smoke:flutterwave`; vitest rail-failover.

## 2026-08-23 — Flutterwave after IP whitelist

- IP whitelist worked (no more IP error).
- New FW error: **merchant is not enabled to make transfers.**
- Failover path still hits Flutterwave; ledger not debited on fail.

## 2026-08-23 — Flutterwave docs fact-check (correction)

- User called out: must use FW docs + update memory/FACT_CHECK (valid).
- Official [Transfers intro](https://developer.flutterwave.com/v3.0/docs/introduction-6): (1) enable **Transfer via API** at Settings→preferences/security (2) whitelist IPs.
- Dashboard **Make a transfer** wizard ≠ enabling Transfer via API.
- Live error after IP whitelist: `merchant is not enabled to make transfers` ≈ docs *Merchant not enabled for API Disburse*.
- Wrote `memory/FLUTTERWAVE.md`; rewrote `memory/FACT_CHECK.md`; updated `RAILS_AND_PARTNERS.md`.

## 2026-08-23 — Flutterwave full settle PASS

- After Transfer via API enabled: direct FW + `/pay` preferRail PASS.
- txId `2222847`, status pending, provider flutterwave; ledger 500→400 NGN.
- Verdict PASS in `memory/SMOKE_FLUTTERWAVE.json`.

## 2026-08-23 — Stellar USDC + threat model + dashboard hash

- Default Circle testnet issuer `GBBD47IF…FLA5` in `/pay`; Edge secrets `STELLAR_USDC_*` set.
- Treasury trustline tx `4892cf5a…9a1d`; USDC balance 0 — need Circle faucet.
- Scripts: `npm run setup:stellar-usdc`, `npm run smoke:stellar-usdc`.
- Dashboard Transactions: Stellar column → stellar.expert link.
- `docs/THREAT_MODEL.md` draft (P0.2).

## 2026-08-23 — Stellar USDC settle PASS + DX honesty

- Treasury USDC 20; `/pay` USDC settled hash `55c1eb9a…b7f8`; ledger 10→9 USD.
- Explorer: https://stellar.expert/explorer/testnet/tx/55c1eb9a2fdeff6cf8ac921f19686ed0826910ea4c1ffc6f049521bb3c55b7f8
- Landing CodeIntegrationSection + Docs quickstart now use real Edge fetch/curl (no fictional `@paysmith/sdk`).

## 2026-08-23 — RLS cross-tenant isolation

- First smoke **failed**: live `agent_wallets` had policy `Demo Access` `USING (true) FOR ALL` — any authed user could read/update/delete any wallet.
- Migration `20260823180000_fix_agent_wallets_rls.sql`: drop Demo Access; restore owner-scoped policies (txn policies cast `id::text`).
- Re-smoke **PASS** (select empty, update no-op, txn insert 403, delete blocked, owner select ok).
- Script: `npm run smoke:rls` → `memory/SMOKE_RLS.json`; also wired into `smoke:ci` when service+anon keys present.

## 2026-08-23 — agents-create schema align

- Live `agent_wallets` uses UUID id, `daily_cap`/`max_per_tx`, required `email` — not `spending_policy`, `payment_methods`, or per-wallet `api_key`.
- `/agents-create` was 500: `Could not find the 'api_key' column`.
- Fixed Edge functions + deployed; maps `spendingPolicy` ↔ `daily_cap`/`max_per_tx`; generates agent email; returns UUID.
- `agents-balance` reads live balance columns (`balance_usd`, etc.) and maps spending policy from caps.
- Smoke: `npm run smoke:agents-create` PASS → `memory/SMOKE_AGENTS_CREATE.json`.

## 2026-08-23 — Reconcile ledger orphans

- Added `transactions.ledger_debited_at`; `/pay` marks timestamp after successful debit.
- New Edge `reconcile-ledger` (service-role or `WEBHOOK_INTERNAL_SECRET`): scans NULL debits on settled/pending txs, retries wallet debit.
- Smokes: `npm run smoke:reconcile` PASS; `smoke:ci` adds reconcile unauth 401.

## 2026-08-23 — Admin audit + payment_methods + reconcile cron

- `admin_audit_log` + trigger on `user_roles`; `smoke:admin-audit` PASS.
- `agent_wallets.payment_methods` column; agents-create/balance persist + return; smoke PASS.
- Cron: `paysmith-reconcile-ledger` every 15m via `pg_cron`/`pg_net`/`invoke_reconcile_ledger()` per [Supabase schedule-functions](https://supabase.com/docs/guides/functions/schedule-functions); Vault secrets via `npm run setup:reconcile-cron`.
- FACT_CHECK corrected: FW + USDC settle ✅ (older “path only / needs issuer” rows outdated).

## 2026-08-23 — P5–P10 finish pass (research + stubs)

- **Partna fact-check:** Official OpenAPI — USDC on celo/ethereum/solana/tron; **no Stellar**. Updated `memory/PARTNA.md`; `partna-quote` Edge returns 501 until keys.
- **MoneyGram:** `memory/MONEYGRAM.md` — partner portal + SEP-24 path (apply only).
- **SCF Build:** `memory/SCF_BUILD_PACK.md` — interest form pack; #46 Nov 8, 2026 per communityfund.stellar.org.
- **Marketing:** `memory/SCF_DEMO_THREAD.md` + `memory/TRACTION.md` (drafts; no invented counts).
- **Tavily:** `scripts/research-tavily.mjs` + `npm run research:tavily`.
- **Deploy note (corrected):** Earlier same-day session deployed with user-pasted `sbp_…` token kept in shell env — not “never connected.” Handoff wrongly said blocked because token was not in `.env`.

## 2026-08-23 — Deploy correction + re-push

- User called out bogus “blocked / env lost” handoff — fair.
- **Truth:** You pasted `SUPABASE_ACCESS_TOKEN` ~02:09 UTC; we linked, `db push`, deployed pay/agents/reconcile/etc. Same shell kept token; later smokes used service_role only.
- **This turn:** Re-verified CLI with your token; `db push` up to date; redeployed `pay` (v106, debit-fail idempotency), `partna-quote` (v1), all core functions.
- Persisted `SUPABASE_ACCESS_TOKEN` + `TAVILY_API_KEY` in `.env`; ran `npm run research:tavily` → `memory/TAVILY_RESEARCH.json`.
- **Stellar:** Horizon USDC/XLM via `@stellar/stellar-sdk` in Edge — no `stellar` CLI required. **Soroban contract** still needs Rust/`soroban-cli` install on this Windows box (cargo not present).

## 2026-08-23 — Roadmap realignment (testnet enterprise → waitlist → grants)

- User priority: **T1 testnet enterprise sandbox** for Africa AI agent builders before waitlist / Builder Circle / Instaward.
- Rewrote `memory/ROADMAP.md` (T0–T5 phases); added `memory/TESTNET_READINESS.md` gate checklist.
- `TRACTION.md`: waitlist after T1; metrics = T3 beta evidence.
- Added `npm run test:gate` — full unit + all live smokes in one command.

## 2026-08-23 — T1 executed (gate PASS)

- `npm run test:gate`: unit 19 PASS; webhook/reconcile/RLS; agents-create; reconcile; admin-audit; Paystack; Flutterwave; Stellar XLM; Stellar USDC — all PASS.
- Stress: `smoke:stress` 8 concurrent `/pay` same Idempotency-Key → 1×200 + 7×409; ledger −0.1 XLM once (`memory/SMOKE_STRESS_IDEMPOTENCY.json`).
- Copy: Pricing (sandbox free), Blog (no “private beta”), hero + CTA `#waitlist`, ApiPlayground live URL + UUID samples.
- Tavily re-run: SCF #46 Nov 8 2026 confirmed; MoneyGram SEP-24 apply path.
- Artifacts: `memory/TESTNET_GATE.json`, FACT_CHECK / ROADMAP / TESTNET_READINESS / CURRENT_STATE updated.
- **T1 green → T2 ready** (waitlist + Builder Circle NG + Stellar Ghana) when user says go.
- Still optional: Soroban CLI deploy, `@paysmith/sdk` npm (needs org key).

## 2026-08-23 — Agent tooling write (SDK / CLI / MCP / skills)

- Rewrote `@paysmithhq/sdk` → **0.2.0**: modular client, typed Edge map, 429 retry, `newIdempotencyKey`, vitest **6 PASS**, `tsc` build PASS.
- Added `@paysmithhq/cli@0.2.0` (`paysmith create|balance|wallets|pay`).
- Added `@paysmithhq/mcp@0.2.0` (`paysmith-mcp` tools: create/list/balance/pay).
- Skills: `.cursor/skills/paysmith-agent-payments` + `.claude/skills/…`; `AGENTS.md`; `integrations/{cursor,claude,codex}`.
- Root scripts: `sdk:test`, `cli:build`, `mcp:build`, `agent-tools:build`.
- **Not yet published:** registry still `sdk@0.1.1`; need fresh token for `0.2.0` + cli + mcp.

## 2026-08-23 — `@paysmithhq/sdk@0.1.1` published


- Org confirmed via `npm org ls paysmithhq` (`henrysammarfo` owner).
- Published public `@paysmithhq/sdk@0.1.1`; `npm view` returns latest `0.1.1`.
- Page: https://www.npmjs.com/package/@paysmithhq/sdk
- Install: `npm i @paysmithhq/sdk`
- No `.npmrc` left; user should revoke chat-pasted token.

## 2026-08-23 — npm publish attempt (`@paysmithhq/sdk`)

- Token authenticated as `henrysammarfo`.
- Org `paysmithhq` **does not exist** (`/-/org/paysmithhq` → ResourceNotFound).
- First publish left ghost state: republish `0.1.0` → 403 “previously published”; `npm view` / install still 404.
- Bumped package to **`0.1.1`**; no `.npmrc` left on disk; token not committed.
- Next: user creates org at npmjs.com/org/create, then **publish sdk**; revoke chat-pasted token after.

## 2026-08-23 — NPM guide + Soroban enforce + research deep-dive

- Wrote `docs/NPM_PUBLISH_SETUP.md` — step-by-step org + granular token for user.
- `/pay` now **simulates Soroban `check_spend`** when contract ID set (fail-closed; soft-fail only via env). Redeployed; XLM smoke PASS with `policyEnforcement: soroban+off-chain`.
- Tavily research → `memory/RESEARCH_AGENT_RAILS.md` (MoMo agent gap, Pretium/IvoryPay, Ghana Act 1154 sandbox, next sandboxes).
- Updated `docs/THREAT_MODEL.md`, `COMPLIANCE.md`, `FACT_CHECK.md`, `FULL_OVERVIEW.md`.
- Unit tests: 21 PASS including soroban scaling helpers.

- Installed Rust 1.98, Stellar CLI 27.1, MSYS2 MinGW (VS Build Tools / Windows SDK winget installs failed; MinGW path works).
- Fixed contract `#[contracterror]`; `stellar contract build` → wasm 1364 bytes.
- **Deployed testnet** `CAOJF27FUDJB3IAH27QYDE6HVLKC7R7VCUBAZ64Y3VLKIQDQ2WTMW5ZY` (lab + expert links in `memory/SOROBAN_DEPLOY.json`).
- `check_spend` smoke: within limits → null/Ok; amount 201 → Contract #1.
- Edge secret `STELLAR_SOROBAN_POLICY_CONTRACT_ID` set; `pay` redeployed.
- `@paysmith/sdk@0.1.0` at `packages/sdk` — `npm run sdk:build` PASS; **publish blocked on `npm login`** (ENEEDAUTH).
- Scripts: `npm run deploy:soroban`, `npm run sdk:build`.
- `memory/INSTAWARD_SPRINT.md` — Stellar Ghana 30-day scope + demo script (engineering evidence).
- `memory/PARTNA.md` — Partna v4 spike from official docs (NG/KES live; GHS launching; not integrated).
- `contracts/spending-policy/` — Soroban `check_spend` scaffold (cargo test locally; not deployed).
- Updated stellar skill + RAILS_AND_PARTNERS to match live state.

## 2026-08-23 — Agent tooling write (SDK / CLI / MCP / skills)

- Rewrote `@paysmithhq/sdk` → **0.2.0**: typed Edge client, vitest 6 PASS, tsc PASS.
- Added `@paysmithhq/cli@0.2.0` (`paysmith`) and `@paysmithhq/mcp@0.2.0` (`paysmith-mcp`).
- Skills: `.cursor/skills/paysmith-agent-payments` + `.claude/skills/…`; `AGENTS.md`; `integrations/{cursor,claude,codex}`.
- Registry still `sdk@0.1.1` until publish with a fresh npm token (`publish agent tools`).

## 2026-08-24 — Published agent tools to npm

- `@paysmithhq/sdk@0.2.0` live (`npm view` + install OK).
- `@paysmithhq/cli@0.2.2` + `@paysmithhq/mcp@0.2.2` live (first 0.2.0/0.2.1 publishes left broken package roots; 0.2.2 repaired; `npx paysmith --help` OK).
- Token used from chat — **revoke after use**.

## 2026-08-24 — Horizon tx_failed diagnosis + Daraja/MTN key path

- Root cause: Soroban `try_spend` + Horizon payment shared `STELLAR_TREASURY_SECRET` → sequence race / timeouts (`transaction_failed`, then try_spend not confirmed).
- Fix: pre-check with simulate `check_spend`; record `try_spend` **after** settle. Smoke XLM **PASS** (`policyEnforcement: soroban-recorded+off-chain`, hash `26babf8d…`).
- Daraja / MTN sandbox keys: **easy & free** via portals (~15–30 min); documented in `memory/RAILS_DARAJA_MTN.md` + `.env.example`. Integration still waits on you pasting keys.

- npm smoke PASS (`smoke:npm`, 2 wallets) · Cursor MCP wired (`setup:cursor-mcp`)
- Soroban v2 `try_spend`/`get_spent` + `/pay` submit path (wasm redeploy pending)
- MCP `@modelcontextprotocol/sdk` built locally (0.2.3)
- Playwright `e2e/dashboard.spec.ts` · `docs/PEN_TEST_STATUS.md` · `RAILS_DARAJA_MTN.md`
- T2: waitlist copy, `BUILDER_CIRCLE_NG.md`, thread + traction updates (0 waitlist · 21 wallets · 34 txs · 7 Stellar)

## 2026-08-24 — Commit, push main, Vercel deploy

- Commit `806ae72` on `main` (142 files): testnet rails, agent SDK/CLI/MCP, Daraja/MTN, Soroban, T2 packs. `.env` not committed.
- Pushed `origin/main`.
- Created Vercel project `teamtitanlink/paysmith` linked to GitHub; set `VITE_SUPABASE_*` env; production alias **https://paysmith-eight.vercel.app** (redeploy Ready).
- Edge functions already live on Supabase `hkngxtrqhnkzkbqgqbjk` (no re-deploy needed this turn).
- Added `.vercelignore` to avoid multi-GB CLI uploads.
## 2026-08-24 — Waitlist email via tryopal.asia (Resend)

- Verified Resend domain: tryopal.asia (status verified)
- Set Edge secret RESEND_FROM=Paysmith <paysmith@tryopal.asia>
- waitlist-join emailSent PASS for patrickkesh90@gmail.com (duplicate resend)

## 2026-08-31 — God of Prompt → Paysmith Growth OS

- Researched godofprompt.ai/prompts via WebFetch + Tavily (TinyFish key not in .env).
- Inherited Role/Context/Task/Output + marketing/SEO/sales/email/social categories.
- Wrote `memory/GROWTH_WAITLIST_100.md`: 9 Paysmith-filled prompts + 14-day sprint to 100 waitlist / 50 returning actives.

## 2026-10-17 — Stellar 14 Demo Day pack

- Research: Protocol/SDK 17+28, Freighter, OZ Contracts/Relayer, Smart Account Kit, Lab, Raven MCP (Tavily + stellar docs).
- Contract source: `init_admin`, `set_wallet_policy`, `get_wallet_policy`, richer spend events.
- App: `/stellar` Freighter connect demo for judges.
- Docs: `docs/STELLAR14_ECOSYSTEM.md`, `memory/STELLAR14_DEMO_DAY_FORM.md`, Instaward sprint refresh.
- Repo was private — must flip public for form.

## 2026-10-17 — Implement stack, deploy, tests, submission

- Soroban SDK → **29.0.1**; `stellar contract build` + deploy → `CAXYX34F…L46VNKUW`.
- On-chain `try_spend` success (explorer tx `176706a7…`).
- `cargo test` 4/4 (Windows: crate-type `rlib` for host tests; stellar build forces cdylib).
- SDK: `OpenZeppelinRelayerClient` + stellar/relayer unit tests; Edge pay pin 14.2.0 + legacy ID remap.
- Criteria peers refreshed (NG SCF #44, Instaward handbook); `INSTAWARD_30_DAY_PLAN` + `STELLAR14_FINAL_SUBMISSION.md`.
- Smokes: `smoke:agent-stellar` PASS; `smoke:stellar`/`stress` saw Cloudflare socket flakes — retry on stage network.
- Blocker: Supabase CLI access token invalid — cannot secrets-set / functions-deploy until `supabase login`.
