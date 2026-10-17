# Paysmith waitlist nurture sequence (5 emails)

**From:** `Paysmith <paysmith@tryopal.asia>`  
**Audience:** Builder waitlist (GH/NG/KE/ZA)  
**Send:** Day 0 (on join, automated) · Day 2 · Day 4 · Day 7 · Day 10  
**Honest:** Sandbox only — not mainnet.

---

## Email 1 — Welcome (Day 0, automated)

**Subject:** You're on the Paysmith builder waitlist  
**Preview:** Sandbox API keys rolling out for Africa agent builders.

**Body:**

Hi — thanks for joining the Paysmith builder waitlist.

We're building policy-bound wallets for AI agents that pay via MoMo/bank sandboxes and Stellar testnet USDC — from Accra, for GH/NG/KE builders first.

You'll get a sandbox API key (`ps_test_…`) by email as we widen the beta cohort. No spam, no fake urgency.

Meanwhile:
```bash
npm i @paysmithhq/sdk
```
Docs: https://paysmith-eight.vercel.app/docs

Sandbox only — not mainnet. Reply anytime.

— Henry / Paysmith

---

## Email 2 — Story + Accra (Day 2)

**Subject:** Why we're building agent wallets from Accra  
**Preview:** One API for MoMo, bank sandboxes, and Stellar testnet.

**Body:**

Quick story — no pitch deck.

Every Africa AI hackathon hits the same wall: the agent works, then it can't pay. MoMo, bank rails, USDC settlement — everyone rebuilds from scratch.

Paysmith is the sandbox we wished existed: one API, spending caps, idempotent `/pay`, SDK + MCP for agents.

Built in Accra 🇬🇭 · testnet honest · Stellar + PSP sandboxes.

You're on the list. When your cohort opens, you'll get `ps_test_…` first.

Peek the docs while you wait: https://paysmith-eight.vercel.app/docs

— Paysmith

---

## Email 3 — SDK in 3 lines (Day 4)

**Subject:** 3 lines to your first agent wallet (sandbox)  
**Preview:** Install SDK → create wallet → check balance.

**Body:**

You don't need a live key to read the docs — but calls need `ps_test_…` from us.

When you get yours, the flow looks like this:

```bash
npm i @paysmithhq/sdk
```

```ts
import { Paysmith, newIdempotencyKey } from "@paysmithhq/sdk";

const ps = new Paysmith({ apiKey: "ps_test_…" });
const { walletId } = await ps.createAgent({
  name: "demo-agent",
  country: "GH",
  currency: "GHS",
});
const bal = await ps.getBalance(walletId);
```

Playground (when you have a key): https://paysmith-eight.vercel.app/playground

Still waitlist-only for keys — you're queued.

— Paysmith

---

## Email 4 — Stellar USDC tease (Day 7)

**Subject:** Same /pay endpoint — Stellar testnet USDC  
**Preview:** Explorer-verifiable txs, not mock JSON.

**Body:**

Fiat sandboxes are half the story.

Paysmith also settles **Stellar testnet USDC + XLM** on the same `/pay` endpoint — Horizon hash you can open on stellar.expert.

Use case: agent treasury in USDC, payout to MoMo/bank sandbox in local currency (testnet).

We're not claiming mainnet corridors or licensed off-ramp yet. This is builder infrastructure for demos, SCF prep, and chapter hacks.

Want early access to run a Stellar + MoMo demo? Reply with your use case (2 sentences).

Docs: https://paysmith-eight.vercel.app/docs

— Paysmith

---

## Email 5 — Beta cohort (Day 10)

**Subject:** Want into the next Paysmith beta cohort?  
**Preview:** 15 min demo or async — sandbox key priority.

**Body:**

We're opening the next sandbox cohort for builders who will actually stress-test the API.

If you want priority for a `ps_test_…` key, pick one:

1. **Reply** with: corridor (GH/NG/KE), what you're building, and one rail you need most (MoMo / bank / Stellar).
2. **Or** book 15 min: [insert Calendly or reply "demo" and we'll send a link]

What we ask in return: honest feedback — what broke, what's missing, what you'd ship with this.

Not mainnet. Not KYB for sandbox. Just builders helping us harden the testnet.

Waitlist: https://paysmith-eight.vercel.app/#waitlist

Thanks for being early.

— Henry / Paysmith

---

## Resend automation (manual for now)

Until Resend Audiences + automations are wired:

```bash
node scripts/send-nurture-email.mjs 2 you@email.com
```

Numbers: `1`–`5` (1 = welcome copy preview only; live welcome is `waitlist-join`).

## Metrics

| Email | Target open | Target click |
|-------|-------------|--------------|
| 1 | ≥50% | docs |
| 2 | ≥40% | docs |
| 3 | ≥35% | playground/docs |
| 4 | ≥35% | reply rate |
| 5 | ≥30% | reply / book |
