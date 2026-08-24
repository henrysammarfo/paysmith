import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paysmith-internal-secret",
};

function balanceColumnForCurrency(currency: string): string | null {
  const c = currency.toUpperCase();
  if (c === "NGN") return "balance_ngn";
  if (c === "GHS") return "balance_ghs";
  if (c === "KES") return "balance_kes";
  if (c === "USDC" || c === "USD") return "balance_usd";
  if (c === "XLM") return "balance_xlm";
  return null;
}

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get("Authorization") ?? "";
  const internalSecret = Deno.env.get("WEBHOOK_INTERNAL_SECRET");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const headerSecret = req.headers.get("X-Paysmith-Internal-Secret") ?? "";
  return (
    (serviceRole.length > 0 && bearer === serviceRole) ||
    (internalSecret != null &&
      internalSecret.length > 0 &&
      (bearer === internalSecret || headerSecret === internalSecret))
  );
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

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let limit = 50;
    try {
      const body = await req.json();
      if (typeof body?.limit === "number" && body.limit > 0 && body.limit <= 200) {
        limit = Math.floor(body.limit);
      }
    } catch {
      // empty body ok
    }

    const { data: orphans, error: listError } = await supabase
      .from("transactions")
      .select("id, agent_wallet_id, amount, currency, status, rail_tx_id, created_at")
      .is("ledger_debited_at", null)
      .in("status", ["settled", "pending"])
      .order("created_at", { ascending: true })
      .limit(limit);

    if (listError) {
      return new Response(JSON.stringify({ error: listError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<Record<string, unknown>> = [];
    let debited = 0;
    let blocked = 0;
    let errors = 0;

    for (const tx of orphans ?? []) {
      const balCol = balanceColumnForCurrency(tx.currency);
      if (!balCol) {
        blocked++;
        results.push({
          txId: tx.rail_tx_id,
          id: tx.id,
          outcome: "blocked",
          reason: "unsupported_currency",
        });
        continue;
      }

      const { data: wallet, error: walletError } = await supabase
        .from("agent_wallets")
        .select(`id, ${balCol}`)
        .eq("id", tx.agent_wallet_id)
        .maybeSingle();

      if (walletError || !wallet) {
        errors++;
        results.push({
          txId: tx.rail_tx_id,
          id: tx.id,
          outcome: "error",
          reason: walletError?.message ?? "wallet_not_found",
        });
        continue;
      }

      const amount = Number(tx.amount);
      const available = Number((wallet as Record<string, unknown>)[balCol] ?? 0);
      if (available < amount) {
        blocked++;
        results.push({
          txId: tx.rail_tx_id,
          id: tx.id,
          outcome: "blocked",
          reason: "insufficient_balance",
          available,
          amount,
        });
        continue;
      }

      const debitedAt = new Date().toISOString();
      const { error: debitError } = await supabase
        .from("agent_wallets")
        .update({ [balCol]: available - amount })
        .eq("id", wallet.id);

      if (debitError) {
        errors++;
        results.push({
          txId: tx.rail_tx_id,
          id: tx.id,
          outcome: "error",
          reason: debitError.message,
        });
        continue;
      }

      const { error: markError } = await supabase
        .from("transactions")
        .update({ ledger_debited_at: debitedAt })
        .eq("id", tx.id)
        .is("ledger_debited_at", null);

      if (markError) {
        errors++;
        results.push({
          txId: tx.rail_tx_id,
          id: tx.id,
          outcome: "error",
          reason: `debited_but_mark_failed:${markError.message}`,
        });
        continue;
      }

      debited++;
      results.push({
        txId: tx.rail_tx_id,
        id: tx.id,
        outcome: "debited",
        column: balCol,
        amount,
      });
    }

    return new Response(
      JSON.stringify({
        scanned: orphans?.length ?? 0,
        debited,
        blocked,
        errors,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
