// PostHog-style event tracking using a lightweight custom implementation
// Events are stored in the api_call_logs table for self-hosted analytics

import { supabase } from "@/integrations/supabase/client";

type EventProperties = Record<string, string | number | boolean | null>;

class Analytics {
  private userId: string | null = null;
  private devId: string | null = null;

  identify(userId: string) {
    this.userId = userId;
    // Resolve developer id
    supabase
      .from("developers")
      .select("id")
      .eq("auth_id", userId)
      .single()
      .then(({ data }) => {
        if (data) this.devId = data.id;
      });
  }

  reset() {
    this.userId = null;
    this.devId = null;
  }

  async track(event: string, properties?: EventProperties) {
    if (!this.devId) return;

    try {
      await supabase.from("api_call_logs").insert({
        developer_id: this.devId,
        endpoint: event,
        method: "EVENT",
        status_code: properties?.status_code ? Number(properties.status_code) : null,
      });
    } catch (e) {
      console.warn("Analytics track error:", e);
    }
  }
}

export const analytics = new Analytics();

// Pre-defined event names
export const EVENTS = {
  SIGNUP: "user.signup",
  LOGIN: "user.login",
  WALLET_CREATED: "wallet.created",
  WALLET_DELETED: "wallet.deleted",
  API_KEY_CREATED: "api_key.created",
  TRANSACTION_SENT: "transaction.sent",
  WEBHOOK_CONFIGURED: "webhook.configured",
  DASHBOARD_VIEWED: "dashboard.viewed",
  DOCS_VIEWED: "docs.viewed",
  API_PLAYGROUND_USED: "api_playground.used",
} as const;
