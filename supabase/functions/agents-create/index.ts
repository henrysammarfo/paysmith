import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

// ── In-memory rate limiter (per isolate) ───────────────────────────
const RATE_LIMIT = 20; // requests per minute per key
const RATE_WINDOW = 60_000;
const rateBuckets = new Map<string, number[]>();

function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) ?? []).filter(t => now - t < RATE_WINDOW);
  if (timestamps.length >= RATE_LIMIT) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + RATE_WINDOW - now) / 1000);
    rateBuckets.set(key, timestamps);
    return { allowed: false, retryAfter };
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return { allowed: true, retryAfter: 0 };
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

    // Authenticate via API key
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

    // Rate limit check
    const rl = checkRateLimit(apiKey);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Try again in ${rl.retryAfter} seconds.`, retryAfter: rl.retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } }
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

    // Validate input formats
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

    if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
      return new Response(
        JSON.stringify({ error: "currency must be a 3-letter ISO code (e.g. NGN)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate paymentMethods if provided
    const VALID_METHODS = ["mobile_money", "bank_transfer", "crypto", "card"];
    if (paymentMethods !== undefined) {
      if (!Array.isArray(paymentMethods) || paymentMethods.some((m: any) => !VALID_METHODS.includes(m))) {
        return new Response(
          JSON.stringify({ error: `paymentMethods must be an array of: ${VALID_METHODS.join(", ")}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate spendingPolicy if provided
    if (spendingPolicy !== undefined) {
      if (typeof spendingPolicy !== "object" || spendingPolicy === null || Array.isArray(spendingPolicy)) {
        return new Response(
          JSON.stringify({ error: "spendingPolicy must be an object" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { dailyLimit, maxSingleTx, requireApprovalAbove } = spendingPolicy;
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
    }

    // Generate wallet ID and API key
    const walletId = `ps_agent_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const walletApiKey = `ps_wk_${crypto.randomUUID().replace(/-/g, "")}`;

    const defaultPolicy = {
      dailyLimit: 10000,
      maxSingleTx: 2000,
      requireApprovalAbove: 5000,
    };

    const { data, error } = await supabase
      .from("agent_wallets")
      .insert({
        id: walletId,
        owner_id: developer.id,
        name,
        country,
        currency,
        payment_methods: paymentMethods ?? [],
        spending_policy: spendingPolicy ?? defaultPolicy,
        api_key: walletApiKey,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        walletId: data.id,
        apiKey: walletApiKey,
        status: "active",
        name,
        country,
        currency,
        paymentMethods: data.payment_methods,
        spendingPolicy: data.spending_policy,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
