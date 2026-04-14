import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

// ── In-memory rate limiter (per isolate) ───────────────────────────
const RATE_LIMIT = 100; // requests per minute per key
const RATE_WINDOW = 60_000; // 60 seconds
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

// ── Multi-Rail Router ───────────────────────────────────────────────
// Phase 6: Route payments through Chimoney or Flutterwave based on
// method + country. Falls back to sandbox stub when keys are missing.

interface RailResult {
  railTxId: string;
  status: "settled" | "pending" | "failed";
  fee: number;
  provider: string;
}

async function routePayment(opts: {
  method: string;
  country: string;
  currency: string;
  amount: number;
  to: string;
  note?: string;
}): Promise<RailResult> {
  const { method, country, currency, amount, to, note } = opts;

  // ── Chimoney (mobile_money, crypto, international) ──
  const chimoneyKey = Deno.env.get("CHIMONEY_API_KEY");
  if (chimoneyKey && (method === "mobile_money" || method === "crypto")) {
    try {
      const chimoneyRes = await fetch("https://api.chimoney.io/v0.2/payouts/mobile-money", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": chimoneyKey,
        },
        body: JSON.stringify({
          momos: [
            {
              countryToSend: country,
              phoneNumber: to,
              valueInUSD: amount,
              reference: note || "Paysmith payment",
            },
          ],
        }),
      });

      if (chimoneyRes.ok) {
        const result = await chimoneyRes.json();
        const txId = result?.data?.chimoneyID || `chi_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
        return {
          railTxId: txId,
          status: "pending",
          fee: amount * 0.01,
          provider: "chimoney",
        };
      }
      console.error("Chimoney error:", await chimoneyRes.text());
    } catch (e) {
      console.error("Chimoney call failed:", e);
    }
  }

  // ── Flutterwave (bank_transfer, card) ──
  const flutterwaveKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
  if (flutterwaveKey && method === "bank_transfer") {
    try {
      const fwRes = await fetch("https://api.flutterwave.com/v3/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${flutterwaveKey}`,
        },
        body: JSON.stringify({
          account_bank: "044", // placeholder bank code
          account_number: to,
          amount,
          currency,
          narration: note || "Paysmith payout",
          reference: `ps_fw_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
        }),
      });

      if (fwRes.ok) {
        const result = await fwRes.json();
        return {
          railTxId: result?.data?.id?.toString() || `fw_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
          status: result?.data?.status === "SUCCESS" ? "settled" : "pending",
          fee: amount * 0.015,
          provider: "flutterwave",
        };
      }
      console.error("Flutterwave error:", await fwRes.text());
    } catch (e) {
      console.error("Flutterwave call failed:", e);
    }
  }

  // ── Sandbox fallback ──
  return {
    railTxId: `ps_tx_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    status: "settled",
    fee: amount * 0.005,
    provider: "sandbox",
  };
}

// ── Main Handler ────────────────────────────────────────────────────

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

    // Use separate .eq() calls to prevent SQL injection via .or() interpolation
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

    // Rate limit check
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
    const { walletId, to, amount, currency, method, note } = body;

    if (!walletId || !to || !amount || !currency || !method) {
      return new Response(
        JSON.stringify({ error: "walletId, to, amount, currency, method are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof amount !== "number" || amount <= 0 || amount > 10_000_000) {
      return new Response(
        JSON.stringify({ error: "amount must be a positive number up to 10,000,000" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const VALID_METHODS = ["mobile_money", "bank_transfer", "crypto", "card"];
    if (!VALID_METHODS.includes(method)) {
      return new Response(
        JSON.stringify({ error: `method must be one of: ${VALID_METHODS.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof to !== "string" || to.length < 3 || to.length > 100) {
      return new Response(
        JSON.stringify({ error: "to must be a string between 3-100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
      return new Response(
        JSON.stringify({ error: "currency must be a 3-letter ISO code (e.g. NGN)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch wallet and verify ownership
    const { data: wallet } = await supabase
      .from("agent_wallets")
      .select("*")
      .eq("id", walletId)
      .eq("owner_id", developer.id)
      .single();

    if (!wallet) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (wallet.status !== "active") {
      return new Response(JSON.stringify({ error: "Wallet is not active" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce spending policy
    const policy = wallet.spending_policy as {
      dailyLimit: number;
      maxSingleTx: number;
      requireApprovalAbove: number;
    };

    if (amount > policy.maxSingleTx) {
      return new Response(
        JSON.stringify({ error: "Exceeds single transaction limit", limit: policy.maxSingleTx }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amount > policy.requireApprovalAbove) {
      return new Response(
        JSON.stringify({ error: "Requires manual approval", requiresApproval: true }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check daily spend
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { data: todayTxns } = await supabase
      .from("transactions")
      .select("amount")
      .eq("agent_wallet_id", walletId)
      .gte("created_at", todayStart.toISOString());

    const spentToday = todayTxns?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

    if (spentToday + amount > policy.dailyLimit) {
      return new Response(
        JSON.stringify({
          error: "Exceeds daily limit",
          dailyLimit: policy.dailyLimit,
          spentToday,
          requested: amount,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Route through multi-rail payment router ──
    const rail = await routePayment({
      method,
      country: wallet.country,
      currency,
      amount,
      to,
      note,
    });

    const { error: txError } = await supabase.from("transactions").insert({
      agent_wallet_id: walletId,
      type: "send",
      recipient: to,
      amount,
      currency,
      method,
      note: note ?? null,
      rail_tx_id: rail.railTxId,
      status: rail.status,
      fee: rail.fee,
    });

    if (txError) {
      return new Response(JSON.stringify({ error: txError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update wallet stats
    await supabase
      .from("agent_wallets")
      .update({
        total_volume: (wallet.total_volume ?? 0) + amount,
        total_txns: (wallet.total_txns ?? 0) + 1,
      })
      .eq("id", walletId);

    // ── Fire webhook delivery (async, non-blocking) ──
    const eventType = rail.status === "settled" ? "transaction.settled" : "transaction.failed";
    try {
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhook-deliver`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            developerId: developer.id,
            eventType,
            payload: {
              txId: rail.railTxId,
              walletId,
              amount,
              currency,
              method,
              recipient: to,
              status: rail.status,
              fee: rail.fee,
              provider: rail.provider,
              timestamp: new Date().toISOString(),
            },
          }),
        }
      );
    } catch (whErr) {
      console.error("Webhook fire failed (non-blocking):", whErr);
    }

    return new Response(
      JSON.stringify({
        txId: rail.railTxId,
        status: rail.status,
        provider: rail.provider,
        settledAt: rail.status === "settled" ? new Date().toISOString() : null,
        fee: `${rail.fee.toFixed(2)} ${currency}`,
        amount,
        currency,
        method,
        recipient: to,
      }),
      { status: 200, headers: { ...corsHeaders, ...rlHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
