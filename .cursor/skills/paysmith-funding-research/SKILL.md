---
name: paysmith-funding-research
description: Researches active Stellar grants, accelerators, and Africa fintech VCs for Paysmith using Tavily live search. Use when planning funding strategy, SCF submissions, accelerator applications, or ecosystem fit analysis for Paysmith on Stellar.
---

# Paysmith Funding Research

## Before researching

1. Read `memory/SCF_HANDBOOK.md`, `memory/OPPORTUNITIES.md`, `memory/COMPETITORS.md`, `memory/FACT_CHECK.md`
2. Confirm Paysmith Stellar integration status in `memory/CURRENT_STATE.md`
3. **Blocker:** No SCF Build submission until testnet Stellar txs exist — Instawards via Stellar Ghana chapter OK for early sprints
4. Primary handbook: https://stellar.gitbook.io/scf-handbook (fetch live; do not rely on stale memory alone)

## Ghana path

- Engage Stellar Ghana Ambassador Chapter for Instawards ($1k–$5k typical, up to $15k aggregate)
- Narrative: AI agent wallets + GHS MoMo + Stellar USDC (underserved vs Nigeria-heavy awards)

## Live research workflow

Use Tavily API (env: `TAVILY_API_KEY`):

```powershell
$body = @{
  api_key = $env:TAVILY_API_KEY
  query = "Stellar Community Fund open round 2026 deadline"
  search_depth = "advanced"
  max_results = 10
  include_answer = $true
} | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.tavily.com/search" -Method POST -ContentType "application/json" -Body $body
```

Always fact-check Tavily answers against primary sources:
- https://communityfund.stellar.org
- https://stellar.org/blog
- https://github.com/stellar/scf-handbook

## Priority programs (Stellar)

| Program | Typical award | Verify deadline live |
|---------|--------------|---------------------|
| SCF Build | Up to $150k XLM | communityfund.stellar.org |
| Stellar x CV Labs | Up to $150k XLM | stellar.org / CV Labs |
| Soroban adoption fund | Via SCF | stellar.org/soroban |
| Interledger mini-grants | $500–$3k | interledger.org |

## Africa fintech (parallel)

Ajim Capital, YC, Ecobank Fintech Challenge, Tony Elumelu — verify windows on official sites.

## Output format

Update `memory/OPPORTUNITIES.md` with:
- Program name, URL, deadline, award size
- Paysmith fit score (1–5) and blockers
- Verified ✅ / unverified ⚠️ flag

## Anti-hallucination

- Never invent deadlines or cohort status
- Mark closed programs explicitly
- Note when first CV Labs cohort already selected (check latest news)
