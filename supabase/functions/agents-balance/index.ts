import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const RATE_LIMIT = 60;
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

function spendingPolicyFromRow(row: { daily_cap?: number | null; max_per_tx?: number | null }) {
  const dailyLimit = Number(row.daily_cap ?? 10000);
  const maxSingleTx = Number(row.max_per_tx ?? 2000);
  return {
    dailyLimit,
    maxSingleTx,
    requireApprovalAbove: maxSingleTx,
  };
}

function balancesFromRow(row: Record<string, unknown>) {
  const usd = row.balance_usd ?? 0;
  return {
    ghs: row.balance_ghs ?? 0,
    ngn: row.balance_ngn ?? 0,
    usd,
    usdc: usd,
    kes: row.balance_kes ?? 0,
    xlm: row.balance_xlm ?? 0,
  };
}

function walletPayload(row: Record<string, unknown>) {
  return {
    walletId: row.id,
    name: row.name,
    country: row.country,
    currency: row.currency,
    status: row.status,
    balances: balancesFromRow(row),
    paymentMethods: row.payment_methods ?? [],
    spendingPolicy: spendingPolicyFromRow(row as { daily_cap?: number | null; max_per_tx?: number | null }),
    kycTier: row.kyc_tier,
    kycStatus: row.kyc_status,
    createdAt: row.created_at,
  };
}

const WALLET_SELECT =
  "id, name, country, currency, status, balance_ghs, balance_ngn, balance_usd, balance_kes, balance_xlm, daily_cap, max_per_tx, payment_methods, kyc_tier, kyc_status, created_at";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
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
      .select("id")
      .eq("live_api_key", apiKey)
      .maybeSingle();
    if (devByLive) {
      developer = devByLive;
    } else {
      const { data: devByTest } = await supabase
        .from("developers")
        .select("id")
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
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Try again in ${rl.retryAfter} seconds.`, retryAfter: rl.retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } }
      );
    }

    const url = new URL(req.url);
    const walletId = url.searchParams.get("walletId");

    if (walletId) {
      const { data: wallet, error } = await supabase
        .from("agent_wallets")
        .select(WALLET_SELECT)
        .eq("id", walletId)
        .eq("owner_id", developer.id)
        .single();

      if (error || !wallet) {
        return new Response(JSON.stringify({ error: "Wallet not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(walletPayload(wallet)), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: wallets, error } = await supabase
      .from("agent_wallets")
      .select(WALLET_SELECT)
      .eq("owner_id", developer.id)
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        wallets: (wallets ?? []).map((w) => walletPayload(w)),
        count: wallets?.length ?? 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
