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
      .select("id, plan")
      .or(`live_api_key.eq.${apiKey},test_api_key.eq.${apiKey}`)
      .single();

    if (!developer) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { name, country, currency, paymentMethods, spendingPolicy } = body;

    if (!name || !country || !currency) {
      return new Response(
        JSON.stringify({ error: "name, country, currency are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
