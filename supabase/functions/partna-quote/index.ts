import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
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

  const apiKey = Deno.env.get("PARTNA_API_KEY");
  const apiUser = Deno.env.get("PARTNA_API_USER");
  if (!apiKey || !apiUser) {
    return new Response(
      JSON.stringify({
        error: "Partna not configured",
        hint: "Set PARTNA_API_KEY and PARTNA_API_USER; see memory/PARTNA.md",
        stellarNote:
          "Partna OpenAPI lists USDC on celo/ethereum/solana/tron — not Stellar. Paysmith Stellar payouts use Horizon.",
      }),
      { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const url = new URL(req.url);
  const fromCurrency = url.searchParams.get("fromCurrency") || "USDC";
  const toCurrency = url.searchParams.get("toCurrency") || "NGN";
  const fromAmount = url.searchParams.get("fromAmount") || "100";

  try {
    const partnaUrl = `https://staging-api.getpartna.com/v4/rate?fromCurrency=${encodeURIComponent(fromCurrency)}&toCurrency=${encodeURIComponent(toCurrency)}&fromAmount=${encodeURIComponent(fromAmount)}`;
    const res = await fetch(partnaUrl, {
      headers: { "x-api-key": apiKey, "x-api-user": apiUser },
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
