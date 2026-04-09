import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

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

    // Get wallet ID from query params
    const url = new URL(req.url);
    const walletId = url.searchParams.get("walletId");

    if (walletId) {
      // Return single wallet
      const { data: wallet, error } = await supabase
        .from("agent_wallets")
        .select("*")
        .eq("id", walletId)
        .eq("owner_id", developer.id)
        .single();

      if (error || !wallet) {
        return new Response(JSON.stringify({ error: "Wallet not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          walletId: wallet.id,
          name: wallet.name,
          country: wallet.country,
          currency: wallet.currency,
          status: wallet.status,
          balances: {
            ghs: wallet.balance_ghs,
            ngn: wallet.balance_ngn,
            usdc: wallet.balance_usdc,
          },
          paymentMethods: wallet.payment_methods,
          spendingPolicy: wallet.spending_policy,
          totalVolume: wallet.total_volume,
          totalTransactions: wallet.total_txns,
          createdAt: wallet.created_at,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return all wallets for this developer
    const { data: wallets, error } = await supabase
      .from("agent_wallets")
      .select("*")
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
        wallets: (wallets ?? []).map((w) => ({
          walletId: w.id,
          name: w.name,
          country: w.country,
          currency: w.currency,
          status: w.status,
          balances: {
            ghs: w.balance_ghs,
            ngn: w.balance_ngn,
            usdc: w.balance_usdc,
          },
          paymentMethods: w.payment_methods,
          totalVolume: w.total_volume,
          totalTransactions: w.total_txns,
          createdAt: w.created_at,
        })),
        count: wallets?.length ?? 0,
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
