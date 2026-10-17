# Paysmith Growth OS — Waitlist 100 + Active 50

**Updated:** 2026-08-31  
**Source:** God of Prompt free library (`godofprompt.ai/prompts`) + Tavily research  
**TinyFish:** not in `.env` this session — used Tavily + WebFetch  
**North star:** ≥100 waitlist · ≥50 *returning* actives (wallet create or `/pay` ≥2 days apart)

---

## What we inherited (core)

God of Prompt structures every keeper prompt as:

| Block | Rule |
|-------|------|
| **Role** | Specialist identity (not “helpful assistant”) |
| **Context** | Product, audience, constraints, honest claims |
| **Task** | Exact deliverable + constraints |
| **Output** | Format, length, CTA, do-not-claim list |

**RIGS-style (from GoP sales/marketing packs):** Relevance → Insight → Goal → Structure.

**Categories we pulled for Paysmith:** Marketing · SEO · Sales · Email nurture · Social · Funnel · Viral content · Brand voice.

**Do not claim:** mainnet live, pen-test complete, licensed VASP, Partna+Stellar integrated.

---

## Product context (paste into every prompt)

```
Product: Paysmith — testnet sandbox API for AI agent wallets in Africa
One-liner: Policy-bound wallets; MoMo/bank sandboxes + Stellar testnet USDC
Audience: Africa AI builders, Stellar chapter / Builder Circle, fintech hackers (GH/NG/KE)
Proof: npm @paysmithhq/sdk · CLI · MCP · live waitlist emails
Site: https://paysmith-eight.vercel.app/#waitlist
Docs: https://paysmith-eight.vercel.app/docs
Stage: T2 waitlist · sandbox only · built Accra
Tone: Honest, founder-direct, no hype cosplay
```

---

## 14-day sprint (math)

| Day | Channel | Goal |
|-----|---------|------|
| 1–2 | X intro + thread + Ghana WA | +25 waitlist |
| 3–4 | Builder Circle NG + Stellar Discord | +20 |
| 5–6 | LinkedIn founder post + 10 DMs | +15 |
| 7 | SEO: ship 1 blog (long-tail) | +5–10 organic |
| 8–9 | Welcome email sequence (Resend) | activate list |
| 10–11 | Demo Loom + “roast my API” ask | +15 |
| 12–13 | Referral: “invite 2 builders → priority key” | +15 |
| 14 | Retarget list: sandbox challenge | convert to **active** |

**Active returner definition:** same email/dev created wallet OR paid on ≥2 calendar days, or opened docs + ran SDK twice.

---

## Prompt pack (Paysmith-filled)

### 1) Brand voice (Marketing)

```
## Role
You are brand voice lead for an Accra fintech building agent payment rails.

## Context
{{paste Product context}}

## Task
Write a 1-page brand voice guide: do's/don'ts, words we use, words we ban,
3 sample tweets, 2 WhatsApp intros, 1 LinkedIn post — all driving waitlist.

## Output
Markdown. Every sample ends with waitlist URL. Ban: unhackable, live mainnet, “Stripe killer”.
```

### 2) SEO strategy (SEO)

```
## Role
You are an SEO strategist for a developer tools / fintech sandbox.

## Context
Website: https://paysmith-eight.vercel.app
Business: Africa AI agent wallets · Stellar testnet · MoMo sandboxes

## Task
Produce keyword research + on-page plan + 4 blog outlines that convert to waitlist.

## Output
### Primary keywords (3–5)
### Secondary (5–8)
### Long-tail (8–12) — prioritize “AI agent payments Africa”, “Stellar USDC agent wallet”, “MTN MoMo sandbox API”
### On-page fixes for landing + /docs
### 4 blog titles with H2 outline + CTA to #waitlist
### Measurement: GSC queries, waitlist/source UTM
```

### 3) Sales funnel (Sales)

```
## Role
You design B2B/devtool funnels for sandbox → beta key.

## Context
{{paste Product context}}
Funnel goal: waitlist signup → confirmation email → SDK install → first /pay → return day 3

## Task
Map Awareness → Interest → Decision → Action → Retention with channel, message, CTA, metric.

## Output
Table per stage. Include objection handlers for “is this mainnet?” and “do I need KYB?”.
```

### 4) Welcome / nurture emails (Email — already have Resend)

```
## Role
Lifecycle marketer for builder waitlists.

## Context
From: Paysmith <paysmith@tryopal.asia>
Audience: just joined waitlist (GH/NG/KE corridor known)

## Task
Write 5 emails under 120 words each:
1) Welcome (instant)
2) Story + why Accra (day 2)
3) SDK 3-line install (day 4)
4) Stellar USDC demo tease (day 7)
5) “You’re in beta cohort?” ask + calendar link (day 10)

## Output
Subject, preview, body, one CTA. No spam urgency. Honest sandbox.
```

### 5) Cold / community outreach (Sales)

```
## Role
Cold-outreach specialist for developer communities (WhatsApp, Discord, X DM).

## Context
{{paste Product context}}
Target: Stellar Builder Circle, Ghana AI/dev groups, Indie Hackers Africa

## Task
Write 6 messages under 90 words: 2 group intros, 2 DMs, 2 “reply to feedback” templates.
One clear ask: waitlist OR 15-min demo.

## Output
Label channel. Ban jargon walls. Include npm one-liner.
```

### 6) Social calendar (Marketing)

```
## Role
Social strategist for a founder-led Africa fintech account.

## Context
Platforms: X primary, LinkedIn secondary, WhatsApp communities
Goal: 100 waitlist in 14 days

## Task
30-day calendar table: date | pillar | format | hook | CTA | funnel stage
Pillars: Demo proof · Honest build logs · Stellar/Africa thesis · SDK tips · Waitlist social proof

## Output
Markdown table. 40% proof, 30% education, 20% story, 10% ask.
```

### 7) Viral reverse-engineer (Content)

```
## Role
Viral content analyst for fintech Twitter.

## Context
Niche: AI agents + Africa payments + Stellar
Viral post to analyze: {{paste a high-performing builder post}}

## Task
1) Dissect triggers 2) Extract template 3) Generate 10 Paysmith posts from template

## Output
10 posts ≤280 chars each ending with waitlist short link.
```

### 8) Landing CRO critic (Conversion)

```
## Role
Landing-page critic for waitlist conversion.

## Context
Describe current hero + waitlist CTA on paysmith-eight.vercel.app

## Task
List top 5 reasons page might not convert + single highest-impact fix each.
Rewrite hero: brand + one headline + one sentence + one CTA (no clutter).

## Output
Before/after copy. Keep cinematic video. Waitlist-only (no signup).
```

### 9) Active-user retention (Retention → 50 returners)

```
## Role
Product marketer for developer sandboxes.

## Context
Users who joined waitlist and/or created wallets but went quiet.

## Task
Design a “Sandbox Challenge” that forces a return visit:
Day 0: create wallet · Day 1: pay GHS MoMo sandbox · Day 2: Stellar USDC · Day 3: share explorer hash for priority key

## Output
Challenge brief, 3 nudge emails/WhatsApp, success metric = returning active.
```

---

## Channel playbook (execute)

1. **Communities first** (highest ROI): Ghana WA, Builder Circle, Stellar Discord — use prompt #5  
2. **X introducing post** + graphic — already drafted; keep shipping weekly proof  
3. **Email** — Resend via `tryopal.asia` is live; implement prompt #4 as Edge or manual Resend sequences  
4. **SEO** — ship 1 long-tail blog from prompt #2 this week (`/blog`)  
5. **Retention** — prompt #9 before blasting more top-of-funnel

## UTMs (track sources)

```
?utm_source=x&utm_medium=social&utm_campaign=intro_t2
?utm_source=whatsapp&utm_medium=community&utm_campaign=ghana
?utm_source=discord&utm_medium=stellar&utm_campaign=dev_intro
?utm_source=builder_circle&utm_medium=whatsapp&utm_campaign=ng
```

Land on `/#waitlist` — later add `source` field from UTM in `waitlist-join`.

## Weekly scoreboard

| Metric | Target week 1 | Target week 2 |
|--------|---------------|---------------|
| Waitlist | 40 | 100 |
| Email open rate | ≥40% | ≥40% |
| SDK installs (qualitative) | 10 | 30 |
| Returning actives | 15 | 50 |
| Stellar demo shares | 5 | 15 |

---

## Sources

- https://godofprompt.ai/prompts (categories: marketing, sales, SEO, email, social)
- https://godofprompt.ai/blog/structuring-ai-prompts-for-maximum-seo-impact
- https://godofprompt.ai/blog/claude-ai-prompts-for-new-startups (waitlist email pattern)
- Tavily live search 2026-08-31 → `memory/TAVILY_RESEARCH.json`
