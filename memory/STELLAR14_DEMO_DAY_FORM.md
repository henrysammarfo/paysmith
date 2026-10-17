# Stellar 14 Demo Day — form answers (copy-paste)

**Deadline context:** Meetup 2 Demo Day Sat 17 Oct 2026, 12–3pm GMT · Payaza Africa, Labone  
**Repo:** https://github.com/henrysammarfo/paysmith (**must be PUBLIC**)  
**Live:** https://paysmith-eight.vercel.app · Freighter demo: `/stellar`

> **BLOCKERS before submit**  
> 1. Make GitHub repo **public** (`gh repo edit --visibility public`)  
> 2. Team must be **3–5 people** (no solo) — fill real names/emails below  
> 3. Commit window for judging: **5–17 Oct** — Stellar 14 upgrade commit dated **2026-10-17**

---

## Your team

**Team name:** Paysmith

**Team members** (edit — put contact first):
```
Henry Sam Marfo, jasonneil4040@gmail.com, [YOUR_WHATSAPP], henrysammarfo
[Member 2 full name], [email], [WhatsApp], [GitHub]
[Member 3 full name], [email], [WhatsApp], [GitHub]
```

**GitHub repo:** https://github.com/henrysammarfo/paysmith

**How did you join Stellar 14?** (tick what applies)
- [ ] RSVP on Luma
- [ ] Checked in at Meetup 1 (bug hunt)
- [ ] Attended an online Stellar 14 session
- [ ] Attended Office Hours (9 or 16 October)
- Other: Builder Circle / Stellar Ghana community; Accra-based build

**Bug hunt PRs / sessions:** (paste if any)

---

## Your project

**Project one liner:**  
Paysmith is a testnet sandbox API that gives AI agents policy-bound wallets to pay via Africa MoMo/bank sandboxes and settle USDC/XLM on Stellar — for builders shipping agent payments before KYB.

**Did this project exist before 5 October?**  
**Yes, it existed before Stellar 14**

**What existed before 5 October:**  
By 4 October 2026 (last major commit `56c39db` / earlier `806ae72` ship): Paystack + Flutterwave sandboxes, Daraja/MTN MoMo paths, Horizon Stellar XLM+USDC settle, Soroban spending-policy v2 (`try_spend`/`get_spent`), `@paysmithhq/sdk`/`cli`/`mcp`, waitlist + Resend, threat model docs.  
Last pre-window commit: https://github.com/henrysammarfo/paysmith/commit/56c39db (Aug 2026 era) — product live on testnet; Stellar 14 work is the Oct upgrade + Demo Day pack.

**What you built during Stellar 14 (5–17 Oct):**
- Soroban policy **v3 surface**: `init_admin`, `set_wallet_policy`, `get_wallet_policy`; richer `spend` events; stored policy overrides call-site caps
- Freighter connect demo page (`/stellar`) for in-person Demo Day
- Ecosystem map aligning OpenZeppelin Relayer/Contracts, Smart Account Kit, Stellar Lab, Raven MCP (`docs/STELLAR14_ECOSYSTEM.md`)
- Demo Day submission pack + 30-day Instaward scope refresh (`memory/STELLAR14_DEMO_DAY_FORM.md`, `memory/INSTAWARD_SPRINT.md`)
- Docs/README contract function table updated for judges

**Stellar and Soroban components used:** (tick)
- [x] Soroban smart contracts (Rust)
- [x] Stellar assets or tokens
- [x] Payments or path payments *(Horizon payment — path payments roadmap)*
- [ ] Anchors or SEPs *(spike only)*
- [x] Freighter or other Stellar wallets
- [ ] Stellar Wallets Kit *(roadmap)*
- [x] Stellar SDK (JavaScript)
- [x] Stellar CLI
- [x] Stellar Lab
- [ ] Partner protocol
- Other: OpenZeppelin patterns mapped; `@paysmithhq/mcp` for AI agents

**Stellar details:**  
- **Network:** testnet  
- **Contract ID:** `CAHFJKHA7O75475ZI4Y4C6W6PIAR5MZUSNDKPNKADJ7KEHR7XNSTGMBE`  
- **How Stellar is used:** Agent `/pay` settles treasury USDC/XLM via Horizon; Soroban policy contract enforces daily/`max_single_tx` caps on-chain (`try_spend`); Freighter shows judge pubkey; Lab for contract explorer. Fiat last-mile via Paystack/Flutterwave/Daraja/MTN sandboxes.

---

## 30 day plan and demo (Instaward scope)

**Award ask:** **$3,000–$5,000 XLM** (first Instaward band)

### Deliverables (Day 30)
1. Redeployed Soroban policy wasm + Edge on stellar-sdk ≥14/17  
2. OpenZeppelin Relayer (or Channels) for fee-bump / sequence isolation on treasury  
3. Freighter + optional Smart Account Kit passkey path for agent operator auth  
4. Public demo: GHS MoMo sandbox + Stellar USDC settle + on-chain policy 403  
5. ≥50 waitlist + ≥20 returning sandbox actives · threat model updated  

### Week milestones
| Week | Milestone | Owner |
|------|-----------|--------|
| 1 | Redeploy policy v3 · Lab verification · Freighter demo polished | Eng lead |
| 2 | Relayer spike · upgrade JS SDK pin · stress smokes green | Eng |
| 3 | Agent MCP + Raven alignment · SEP-24 spike doc · Ghana MoMo narrative | Eng + chapter |
| 4 | Demo video · Instaward report · SCF Build draft | Team |

### Success criteria (checkable at day 30)
- [ ] Explorer hash for USDC `/pay` in last 7 days  
- [ ] `get_spent` matches ledger daily totals in smoke  
- [ ] Freighter connect works on `/stellar` testnet  
- [ ] Public repo + `docs/THREAT_MODEL.md` current  
- [ ] Chapter demo recording ≤3 min  

### Who does what
- **Contact / product:** Henry Sam Marfo  
- **Contracts / Edge:** [Member 2]  
- **Frontend / Freighter / docs:** [Member 3]  

**Demo link:**  
https://paysmith-eight.vercel.app/stellar  
https://paysmith-eight.vercel.app/#waitlist  
https://lab.stellar.org/smart-contracts/contract-explorer?network=testnet&contractId=CAHFJKHA7O75475ZI4Y4C6W6PIAR5MZUSNDKPNKADJ7KEHR7XNSTGMBE  
*(Add Loom backup before Demo Day)*

---

## Consent
Tick all three when submitting.

## 3-min Demo Day script
1. (30s) Problem — agents can’t pay Africa rails + USDC  
2. (60s) Live: waitlist → SDK one-liner → `/stellar` Freighter → Lab contract  
3. (60s) `/pay` MoMo sandbox + Stellar USDC explorer hash + Soroban policy  
4. (30s) 30-day Instaward scope + ask  
5. (2 min) Q&A — honest: sandbox only, not mainnet
