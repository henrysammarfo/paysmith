# Instaward + SCF criteria A→Z (Paysmith alignment)

**Sources (live 2026-10-17):**  
- https://stellar.gitbook.io/scf-handbook  
- https://stellar.gitbook.io/scf-handbook/scf-awards/instawards/official-rules  
- SCF #45 Africa winners (BitKE) · communityfund.stellar.org  
- Paysmith competitor research + Tavily

---

## A→Z checklist (must meet)

| # | Criterion | Source | Paysmith status |
|---|-----------|--------|-----------------|
| A | Active chapter engagement (meetups, demos, feedback) | Instaward §4 | In progress — Demo Day 17 Oct + Builder Circle posts |
| B | Building on Stellar (not vapor) | Instaward §2 | ✅ Horizon USDC/XLM + Soroban policy |
| C | Clear 30-day scope (not unbounded research) | Instaward §5 | ✅ See `INSTAWARD_30_DAY_PLAN.md` |
| D | Concrete deliverable (MVP, integration, demo, SDK) | Instaward §5 | ✅ API + SDK + Freighter `/stellar` + contract |
| E | Direct Stellar relevance | Instaward §5 | ✅ Settlement + on-chain caps |
| F | Checkable success criteria at day 30 | Instaward §5 | ✅ Listed in 30-day plan |
| G | Scope matches ask ($1k–$5k typical) | Instaward §6 | Ask **$4,000 XLM** — execution sprint, not $150k Build |
| H | Chapter Lead referral path | Instaward §3/§7 | Kaleel / Stellar Ghana Demo Day |
| I | SDF final approval + KYC | Instaward §7 | After nomination |
| J | Ecosystem value / real-world problem | SCF selection | Agent can’t pay Africa rails — real |
| K | Specific audience | SCF Medium guidelines | Africa AI builders GH/NG/KE |
| L | Team capability / readiness | SCF interest form | Ship evidence: smokes + public repo |
| M | Open-source tooling benefit | Instaward examples | `@paysmithhq/sdk`/`cli`/`mcp` public |
| N | Threat model for later Build T2 | SCF Aug 2026 | `docs/THREAT_MODEL.md` exists |
| O | Honest network claims (testnet vs mainnet) | Honesty rule | Testnet only — called out |
| P | On-chain proof for judges | Demo Day | Explorer hashes + Lab contract |
| Q | Differentiation vs funded peers | Market | Agent **spending policies** + MoMo sandboxes (not consumer bank app) |
| R | Momentum / engagement for follow-on | Instaward §8 | Waitlist + chapter demos |
| S | No vague 10-year roadmap as the sprint | Instaward §5 | 30-day = ship; 5–10y = thesis appendix only |
| T | Referral signal for Build later | SCF 7.0 | After Instaward |
| U | Integration track partners known | Handbook | MoneyGram/Bridge/OZ Relayer on roadmap |
| V | Africa corridor narrative | SCF #45 Africa | Stablecoin ↔ local rails (same theme as Sorted/Kutana/Lomi/Minisend) |
| W | Novel use case for Open track later | SCF | **AI agent wallets** — underserved vs remittance apps |
| X | Public GitHub + dated commits | Demo Day form | ✅ public + Oct 17 commits |
| Y | 3–5 person team | Demo Day form | **FILL before submit** |
| Z | Recorded demo backup | Demo Day | Loom required |

---

## What funded Africa / Nigeria projects teach us

| Project | Round / Award | Lesson for Paysmith |
|---------|---------------|---------------------|
| **Sorted** | SCF #45 / ~$150k | Stablecoin UX for low-end phones / intermittent connectivity |
| **Kutana** | #45 / $97k | USDC escrow for African SME trade milestones |
| **Lomi.** | #45 / $95k | Local currency (XOF) ↔ USDC **anchor/bridge** |
| **Seevcash (GH)** | #36 / $142k | Ghana financial inclusion + SCF credibility |
| **RemittEase** | #36 / $54k | Mobile-first remittance + AI narrative |
| **Zynta (Globachain)** | #36 / $89k | Africa↔global stablecoin rails |
| **Centiiv** | #36 / $51k | Decentralized liquidity for African trade |
| **Yolat / Jumpa / Azza / Choppaddi / Paycashless / Blink** | #44 NG / $75–110k | Nigeria corridor heat — marketplace + P2P + AI agent (Azza) |
| **Paykit** | earlier / $53.5k | Stellar payments for **devs & marketplaces** — closest DX peer |
| **Hurupay** | earlier / $82k | Stablecoin orchestration API |

**Instaward rules (must match):** chapter-active · building on Stellar · **≤30-day clear scope** · checkable success · ask typically **$1k–$5k XLM** (follow-ons to $15k). Sources: stellar.gitbook.io SCF Handbook Instawards.

**Gap Paysmith owns:** none of these are **policy-bound AI agent wallets** with MoMo sandboxes + Soroban caps + npm SDK/MCP. That’s the wedge — even vs Azza’s consumer AI agent angle.

---

## Competition (current)

| Competitor | Threat | Our counter |
|------------|--------|-------------|
| Planbok | B2B wallets + Stellar | Agent policies + Africa MoMo DX |
| CowryPay | AI + Stellar consumer | Stay API-first for builders |
| Paykit | Dev payments on Stellar | Agent + Africa MoMo last-mile |
| SelkiePay | Social-handle send | Different wedge; possible collab |
| Wirex/Ultra | Agent + Soroban enterprise | Ship sandbox faster, Ghana-first |

---

## Market sentiment (used to shape 30-day plan)

**Next 30 days (Demo Day → Instaward sprint)**  
- Chapter judges want **live Stellar proof**, Freighter, Lab, short video  
- Builders want **sandbox keys** + honest docs  
- SCF Africa money is flowing to **stablecoin ↔ local rails** — we must show USDC settle + MoMo path  

**Next 5 years**  
- AI agents as economic actors; policy/compliance becomes table stakes  
- Africa MoMo + USDC corridors; anchors/SEPs matter for live KYB  
- Smart accounts / passkeys replace seed-phrase ops for agents  

**Next 10 years**  
- Agent-to-agent settlement standards; Stellar as settlement layer if liquidity + SEPs win  
- Licensed corridors; Paysmith as infra not consumer bank  

**Human sentiment (communities)**  
- “NGN offramp + Stellar is still painful” (Builder Circle)  
- Distrust of mainnet cosplay — honesty wins Ghana chapter  
- Want npm install → pay in minutes  

---

## Scoring ourselves for Demo Day top-2

| Judge lens | Score now | How we max it today |
|------------|-----------|---------------------|
| Stellar depth | 8/10 | Freighter + Lab + Soroban admin/policy + Horizon |
| Execution clarity | 9/10 | 30-day plan with checkable criteria |
| Africa relevance | 9/10 | Accra + MoMo sandboxes |
| Novelty | 9/10 | Agent wallets + MCP |
| Team | ?/10 | **Need 3–5 people on form** |
| Traction | 5/10 | Waitlist + smokes — push hard post-demo |
