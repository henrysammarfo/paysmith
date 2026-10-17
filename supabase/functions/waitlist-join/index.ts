import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000;
const rateBuckets = new Map<string, number[]>();

function checkRateLimit(key: string) {
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) ?? []).filter(
    (t) => now - t < RATE_WINDOW,
  );
  if (timestamps.length >= RATE_LIMIT) {
    rateBuckets.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

async function sendWaitlistEmail(opts: {
  to: string;
  corridor: string;
  duplicate: boolean;
}): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return false;

  const from =
    Deno.env.get("RESEND_FROM") ?? "Paysmith <onboarding@resend.dev>";
  const siteUrl =
    Deno.env.get("PAYSMITH_SITE_URL") ?? "https://paysmith-eight.vercel.app";

  const corridorLabel: Record<string, string> = {
    GH: "Ghana",
    NG: "Nigeria",
    KE: "Kenya",
    ZA: "South Africa",
  };
  const corridorName = corridorLabel[opts.corridor] ?? opts.corridor;

  const subject = opts.duplicate
    ? "You're already on the Paysmith builder waitlist"
    : "You're on the Paysmith builder waitlist";

  const intro = opts.duplicate
    ? "Good news — you're already on our builder waitlist."
    : "Thanks for joining the Paysmith builder waitlist.";

  const html = `<!DOCTYPE html>
<html>
<body style="font-family:Inter,system-ui,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid #333;border-radius:16px;padding:32px;">
    <p style="letter-spacing:0.2em;font-size:12px;color:#999;margin:0 0 8px;">PAYSMITH</p>
    <h1 style="font-size:22px;font-weight:600;margin:0 0 16px;">${subject}</h1>
    <p style="color:#ccc;line-height:1.6;margin:0 0 16px;">${intro}</p>
    <p style="color:#ccc;line-height:1.6;margin:0 0 16px;">
      We're rolling out sandbox API keys (<code style="background:#222;padding:2px 6px;border-radius:4px;">ps_test_…</code>)
      for builders in <strong>${corridorName}</strong>. You'll get yours by email as we expand the beta cohort.
    </p>
    <p style="color:#ccc;line-height:1.6;margin:0 0 24px;">
      Meanwhile you can install the SDK: <code style="background:#222;padding:2px 6px;border-radius:4px;">npm i @paysmithhq/sdk</code>
    </p>
    <a href="${siteUrl}/docs" style="display:inline-block;background:#fff;color:#000;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px;">Read the docs</a>
    <p style="color:#666;font-size:12px;margin:24px 0 0;line-height:1.5;">
      Sandbox only — not mainnet. Questions? Reply or email hello@paysmith.dev
    </p>
  </div>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    // Honeypot — bots fill "website"; humans leave it empty
    if (String(body.website ?? body.company ?? "").trim()) {
      return new Response(JSON.stringify({ ok: true, duplicate: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const corridor = String(body.corridor ?? "GH").toUpperCase().slice(0, 2);
    const source = String(body.source ?? "landing_cta").slice(0, 64);
    const role = String(body.role ?? "builder").slice(0, 32);

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("waitlist_signups").insert({
      email,
      role,
      corridor,
      source,
    });

    let duplicate = false;
    if (error) {
      if (error.code === "23505") {
        duplicate = true;
      } else {
        console.error("waitlist insert", error);
        return new Response(JSON.stringify({ error: "Could not join waitlist" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const emailSent = await sendWaitlistEmail({ to: email, corridor, duplicate });

    return new Response(
      JSON.stringify({ ok: true, duplicate, emailSent }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
