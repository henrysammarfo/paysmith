import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000;
const rateBuckets = new Map<string, number[]>();

function checkRateLimit(key: string): { allowed: boolean; retryAfter: number; remaining: number; reset: number } {
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) ?? []).filter(t => now - t < RATE_WINDOW);
  const reset = timestamps.length > 0 ? Math.ceil((timestamps[0] + RATE_WINDOW - now) / 1000) : Math.ceil(RATE_WINDOW / 1000);
  if (timestamps.length >= RATE_LIMIT) {
    const retryAfter = Math.ceil((timestamps[0] + RATE_WINDOW - now) / 1000);
    rateBuckets.set(key, timestamps);
    return { allowed: false, retryAfter, remaining: 0, reset };
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return { allowed: true, retryAfter: 0, remaining: RATE_LIMIT - timestamps.length, reset };
}

function spendingPolicyFromRow(row: { daily_cap?: number | null; max_per_tx?: number | null }) {
  const dailyLimit = Number(row.daily_cap ?? 10000);
  const maxSingleTx = Number(row.max_per_tx ?? 2000);
  return {
    dailyLimit,
    maxSingleTx,
    requireApprovalAbove: maxSingleTx,
  };
}

function agentEmailFromName(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24) || "agent";
  return `${slug}_${Date.now()}@paysmith.ai`;
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey.length > 100) {
      return new Response(JSON.stringify({ error: "Missing or invalid X-API-KEY header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let developer = null;
    const { data: devByLive } = await supabase
      .from("developers")
      .select("id, plan")
      .eq("live_api_key", apiKey)
      .maybeSingle();
    if (devByLive) {
      developer = devByLive;
    } else {
      const { data: devByTest } = await supabase
        .from("developers")
        .select("id, plan")
        .eq("test_api_key", apiKey)
        .maybeSingle();
      developer = devByTest;
    }

    if (!developer) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rl = checkRateLimit(apiKey);
    const rlHeaders = {
      "X-RateLimit-Limit": String(RATE_LIMIT),
      "X-RateLimit-Remaining": String(rl.remaining),
      "X-RateLimit-Reset": String(rl.reset),
    };
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Try again in ${rl.retryAfter} seconds.`, retryAfter: rl.retryAfter }),
        { status: 429, headers: { ...corsHeaders, ...rlHeaders, "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await req.json();
    const { name, country, currency, paymentMethods, spendingPolicy } = body;

    if (!name || !country || !currency) {
      return new Response(
        JSON.stringify({ error: "name, country, currency are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof name !== "string" || name.length < 1 || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "name must be 1-100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof country !== "string" || !/^[A-Z]{2}$/.test(country)) {
      return new Response(
        JSON.stringify({ error: "country must be a 2-letter ISO code (e.g. NG)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof currency !== "string" || !/^[A-Z]{3,4}$/.test(currency)) {
      return new Response(
        JSON.stringify({ error: "currency must be a 3–4 letter code (e.g. NGN, USDC)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const VALID_METHODS = ["mobile_money", "bank_transfer", "crypto", "card"];
    if (paymentMethods !== undefined) {
      if (!Array.isArray(paymentMethods) || paymentMethods.some((m: unknown) => typeof m !== "string" || !VALID_METHODS.includes(m))) {
        return new Response(
          JSON.stringify({ error: `paymentMethods must be an array of: ${VALID_METHODS.join(", ")}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let dailyCap = 10000;
    let maxPerTx = 2000;
    if (spendingPolicy !== undefined) {
      if (typeof spendingPolicy !== "object" || spendingPolicy === null || Array.isArray(spendingPolicy)) {
        return new Response(
          JSON.stringify({ error: "spendingPolicy must be an object" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { dailyLimit, maxSingleTx, requireApprovalAbove } = spendingPolicy as Record<string, unknown>;
      if (
        (dailyLimit !== undefined && (typeof dailyLimit !== "number" || dailyLimit <= 0)) ||
        (maxSingleTx !== undefined && (typeof maxSingleTx !== "number" || maxSingleTx <= 0)) ||
        (requireApprovalAbove !== undefined && (typeof requireApprovalAbove !== "number" || requireApprovalAbove <= 0))
      ) {
        return new Response(
          JSON.stringify({ error: "spendingPolicy values must be positive numbers" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (dailyLimit !== undefined) dailyCap = dailyLimit;
      if (maxSingleTx !== undefined) maxPerTx = maxSingleTx;
    }

    const methods = Array.isArray(paymentMethods) ? paymentMethods : [];

    const { data, error } = await supabase
      .from("agent_wallets")
      .insert({
        owner_id: developer.id,
        name,
        email: agentEmailFromName(name),
        country,
        currency,
        daily_cap: dailyCap,
        max_per_tx: maxPerTx,
        payment_methods: methods,
        status: "active",
      })
      .select(
        "id, name, country, currency, status, daily_cap, max_per_tx, payment_methods, kyc_tier, kyc_status, created_at",
      )
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const policy = spendingPolicyFromRow(data);

    return new Response(
      JSON.stringify({
        walletId: data.id,
        status: data.status,
        name: data.name,
        country: data.country,
        currency: data.currency,
        paymentMethods: data.payment_methods ?? methods,
        spendingPolicy: policy,
        kycTier: data.kyc_tier,
        kycStatus: data.kyc_status,
        createdAt: data.created_at,
      }),
      { status: 201, headers: { ...corsHeaders, ...rlHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
