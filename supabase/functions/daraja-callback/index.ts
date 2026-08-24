/**
 * Daraja B2C ResultURL / QueueTimeOutURL receiver (sandbox).
 * Accepts Safaricom async callbacks; no auth required for sandbox smoke.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log("daraja-callback", body.slice(0, 2000));
  } catch (e) {
    console.error("daraja-callback read error", e);
  }

  return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
