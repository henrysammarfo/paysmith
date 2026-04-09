import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

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
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing X-API-KEY header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: developer } = await supabase
      .from("developers")
      .select("id")
      .or(`live_api_key.eq.${apiKey},test_api_key.eq.${apiKey}`)
      .single();

    if (!developer) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { walletId, to, amount, currency, method, note } = body;

    if (!walletId || !to || !amount || !currency || !method) {
      return new Response(
        JSON.stringify({ error: "walletId, to, amount, currency, method are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "amount must be a positive number" }),
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

    // Stub: In production, route via Chimoney/Flutterwave based on method
    // For now, simulate a successful transaction
    const txId = `ps_tx_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const fee = amount * 0.005;

    const { error: txError } = await supabase.from("transactions").insert({
      agent_wallet_id: walletId,
      type: "send",
      recipient: to,
      amount,
      currency,
      method,
      note: note ?? null,
      rail_tx_id: txId,
      status: "settled",
      fee,
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

    return new Response(
      JSON.stringify({
        txId,
        status: "settled",
        settledAt: new Date().toISOString(),
        fee: `${fee.toFixed(2)} ${currency}`,
        amount,
        currency,
        method,
        recipient: to,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
