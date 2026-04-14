import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface WebhookLog {
  id: string;
  event_type: string;
  payload: any;
  response_status: number | null;
  delivered_at: string | null;
  created_at: string;
}

const WebhookLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);

    const { data: dev } = await supabase
      .from("developers")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!dev) { setLoading(false); return; }

    const { data } = await supabase
      .from("webhook_logs")
      .select("*")
      .eq("developer_id", dev.id)
      .order("created_at", { ascending: false })
      .limit(100);

    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [user]);

  const handleRetry = async (log: WebhookLog) => {
    if (!user) return;
    setRetrying(log.id);

    const { data: dev } = await supabase
      .from("developers")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!dev) { setRetrying(null); return; }

    try {
      const res = await supabase.functions.invoke("webhook-deliver", {
        body: {
          developerId: dev.id,
          eventType: log.event_type,
          payload: log.payload,
        },
      });

      if (res.error) throw res.error;
      toast.success("Webhook re-delivered!");
      await fetchLogs();
    } catch (err: any) {
      toast.error(err.message || "Retry failed");
    }
    setRetrying(null);
  };

  const getStatusInfo = (log: WebhookLog) => {
    if (log.response_status === null || log.delivered_at === null) {
      return { label: "Skipped", color: "text-muted-foreground", icon: Clock, bg: "bg-muted/30" };
    }
    if (log.response_status >= 200 && log.response_status < 300) {
      return { label: `${log.response_status} OK`, color: "text-emerald-400", icon: CheckCircle2, bg: "bg-emerald-500/10" };
    }
    return { label: `${log.response_status} Error`, color: "text-red-400", icon: XCircle, bg: "bg-red-500/10" };
  };

  const filtered = logs.filter((l) => {
    if (filter === "success") return l.response_status !== null && l.response_status >= 200 && l.response_status < 300;
    if (filter === "failed") return l.response_status !== null && (l.response_status < 200 || l.response_status >= 300);
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold">Webhook Logs</h1>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 sm:px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "success", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Logs */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No webhook logs yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => {
            const status = getStatusInfo(log);
            const StatusIcon = status.icon;
            return (
              <div key={log.id} className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${status.bg}`}>
                      <StatusIcon size={14} className={status.color} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-mono font-medium truncate block">{log.event_type}</span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 ml-9 sm:ml-0">
                    <span className={`text-xs sm:text-sm font-medium ${status.color}`}>{status.label}</span>
                    <button
                      onClick={() => handleRetry(log)}
                      disabled={retrying === log.id}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2 sm:px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={retrying === log.id ? "animate-spin" : ""} />
                      Retry
                    </button>
                  </div>
                </div>
                {log.payload && (
                  <details className="group">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      View Payload
                    </summary>
                    <pre className="mt-2 rounded-lg bg-secondary/30 border border-border p-3 text-xs text-muted-foreground overflow-x-auto max-h-40">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WebhookLogs;
