import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { developerId, eventType, payload } = await req.json();

    if (!developerId || !eventType || !payload) {
      return new Response(
        JSON.stringify({ error: "developerId, eventType, payload are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch developer webhook config
    const { data: dev } = await supabase
      .from("developers")
      .select("webhook_url, webhook_secret")
      .eq("id", developerId)
      .single();

    if (!dev?.webhook_url) {
      // No webhook configured — log and skip
      await supabase.from("webhook_logs").insert({
        developer_id: developerId,
        event_type: eventType,
        payload,
        response_status: null,
        delivered_at: null,
      });

      return new Response(
        JSON.stringify({ skipped: true, reason: "No webhook URL configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build signature
    const timestamp = Date.now();
    const body = JSON.stringify(payload);
    const signaturePayload = `${timestamp}.${body}`;
    const signature = dev.webhook_secret
      ? createHmac("sha256", dev.webhook_secret).update(signaturePayload).digest("hex")
      : "";

    // Deliver webhook
    let responseStatus: number | null = null;
    let deliveredAt: string | null = null;

    try {
      const res = await fetch(dev.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Paysmith-Event": eventType,
          "X-Paysmith-Timestamp": timestamp.toString(),
          "X-Paysmith-Signature": `sha256=${signature}`,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      responseStatus = res.status;
      deliveredAt = new Date().toISOString();
    } catch (fetchErr) {
      console.error("Webhook delivery failed:", fetchErr);
      responseStatus = 0;
    }

    // Log delivery attempt
    await supabase.from("webhook_logs").insert({
      developer_id: developerId,
      event_type: eventType,
      payload,
      response_status: responseStatus,
      delivered_at: deliveredAt,
    });

    return new Response(
      JSON.stringify({
        delivered: responseStatus !== null && responseStatus >= 200 && responseStatus < 300,
        responseStatus,
        deliveredAt,
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
