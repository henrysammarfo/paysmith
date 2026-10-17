/**
 * Send one waitlist nurture email via Resend (manual drip).
 * Usage: node scripts/send-nurture-email.mjs <1-5> <email>
 * Requires RESEND_API_KEY + RESEND_FROM in .env
 */
import fs from "fs";

const n = Number(process.argv[2]);
const to = process.argv[3];
if (!n || n < 1 || n > 5 || !to) {
  console.error("Usage: node scripts/send-nurture-email.mjs <1-5> <email>");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const from = env.RESEND_FROM ?? "Paysmith <paysmith@tryopal.asia>";
const site = env.PAYSMITH_SITE_URL ?? "https://paysmith-eight.vercel.app";

const emails = {
  1: {
    subject: "You're on the Paysmith builder waitlist",
    html: wrap(
      `<p>Hi — thanks for joining the Paysmith builder waitlist.</p>
<p>We're building policy-bound wallets for AI agents (MoMo/bank sandboxes + Stellar testnet USDC) from Accra.</p>
<p>You'll get a sandbox API key (<code>ps_test_…</code>) as we widen the beta cohort.</p>
<p><code>npm i @paysmithhq/sdk</code></p>
<p><a href="${site}/docs">Read the docs</a></p>
<p style="color:#666;font-size:12px;">Sandbox only — not mainnet.</p>`,
    ),
  },
  2: {
    subject: "Why we're building agent wallets from Accra",
    html: wrap(
      `<p>Every Africa AI hackathon hits the same wall: the agent works, then it can't pay.</p>
<p>Paysmith is the sandbox we wished existed — one API, spending caps, idempotent <code>/pay</code>, SDK + MCP.</p>
<p>Built in Accra 🇬🇭 · testnet honest · Stellar + PSP sandboxes.</p>
<p>You're on the list. <a href="${site}/docs">Peek the docs</a> while you wait.</p>`,
    ),
  },
  3: {
    subject: "3 lines to your first agent wallet (sandbox)",
    html: wrap(
      `<p>When you get <code>ps_test_…</code>, the flow is:</p>
<pre style="background:#222;padding:12px;border-radius:8px;overflow-x:auto;">npm i @paysmithhq/sdk</pre>
<p>Then create agent → balance check. Full snippets in <a href="${site}/docs">docs</a>.</p>
<p>Playground: <a href="${site}/playground">${site}/playground</a></p>`,
    ),
  },
  4: {
    subject: "Same /pay endpoint — Stellar testnet USDC",
    html: wrap(
      `<p>Fiat sandboxes are half the story. Paysmith also settles <strong>Stellar testnet USDC + XLM</strong> on the same <code>/pay</code> endpoint — explorer-verifiable.</p>
<p>Not mainnet. Not licensed off-ramp yet. Builder infra for demos and chapter hacks.</p>
<p>Reply with your use case (2 sentences) for early demo access.</p>
<p><a href="${site}/docs">Docs</a></p>`,
    ),
  },
  5: {
    subject: "Want into the next Paysmith beta cohort?",
    html: wrap(
      `<p>We're opening the next sandbox cohort for builders who will stress-test the API.</p>
<p><strong>Reply</strong> with: corridor (GH/NG/KE), what you're building, and one rail you need (MoMo / bank / Stellar).</p>
<p>We'll prioritize <code>ps_test_…</code> keys for active feedback.</p>
<p>Sandbox only — not KYB for testnet.</p>
<p><a href="${site}/#waitlist">Waitlist</a></p>`,
    ),
  },
};

function wrap(body) {
  return `<!DOCTYPE html><html><body style="font-family:Inter,system-ui,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px 16px;">
<div style="max-width:520px;margin:0 auto;background:#111;border:1px solid #333;border-radius:16px;padding:32px;">
<p style="letter-spacing:0.2em;font-size:12px;color:#999;margin:0 0 8px;">PAYSMITH</p>
${body}
<p style="color:#666;font-size:12px;margin:24px 0 0;">— Paysmith · sandbox only</p>
</div></body></html>`;
}

const { subject, html } = emails[n];
const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ from, to: [to], subject, html }),
});
console.log(res.status, await res.text());
