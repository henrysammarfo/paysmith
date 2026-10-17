import fs from "fs";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/resend-waitlist-one.mjs <email>");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const r = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: env.RESEND_FROM ?? "Paysmith <onboarding@resend.dev>",
    to: [email],
    subject: "You're on the Paysmith builder waitlist",
    html: `<p>Hi — you're confirmed on the Paysmith builder waitlist. We'll email your sandbox API key as we expand the beta.</p><p><a href="https://paysmith-eight.vercel.app/docs">Docs</a> · npm i @paysmithhq/sdk</p>`,
  }),
});
console.log(r.status, await r.text());
