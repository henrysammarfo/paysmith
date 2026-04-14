import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Gauge, TrendingUp, AlertTriangle, X } from "lucide-react";

interface DailyApiCall {
  date: string;
  count: number;
}

interface EndpointStat {
  endpoint: string;
  count: number;
}

const RATE_LIMIT = 100; // must match edge function

const ApiUsageStats = () => {
  const { user } = useAuth();
  const [totalCalls, setTotalCalls] = useState(0);
  const [todayCalls, setTodayCalls] = useState(0);
  const [dailyCalls, setDailyCalls] = useState<DailyApiCall[]>([]);
  const [topEndpoints, setTopEndpoints] = useState<EndpointStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const [recentCallsPerMinute, setRecentCallsPerMinute] = useState(0);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const load = useCallback(async () => {
    if (!user) return;

    const { data: dev } = await supabase
      .from("developers")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!dev) { setLoading(false); return; }

    const { data: logs } = await supabase
      .from("api_call_logs")
      .select("endpoint, created_at")
      .eq("developer_id", dev.id)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (!logs || logs.length === 0) { setLoading(false); return; }

    setTotalCalls(logs.length);

    const today = new Date().toISOString().slice(0, 10);
    setTodayCalls(logs.filter(l => l.created_at.slice(0, 10) === today).length);

    const hasWarning = logs.some(l => l.endpoint.includes("rate-limit-warning"));
    const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
    const recentCalls = logs.filter(l => l.created_at >= oneMinAgo && !l.endpoint.includes("rate-limit-warning")).length;
    setRecentCallsPerMinute(recentCalls);
    setRateLimitWarning(hasWarning || recentCalls >= RATE_LIMIT * 0.8);

    const byDay: Record<string, number> = {};
    for (const l of logs) {
      const day = l.created_at.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    }
    setDailyCalls(
      Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count,
        }))
    );

    const byEndpoint: Record<string, number> = {};
    for (const l of logs) {
      if (l.endpoint.includes("rate-limit-warning")) continue;
      byEndpoint[l.endpoint] = (byEndpoint[l.endpoint] || 0) + 1;
    }
    setTopEndpoints(
      Object.entries(byEndpoint)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([endpoint, count]) => ({ endpoint, count }))
    );

    setLastRefreshed(new Date());
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading || totalCalls === 0) return null;

  const usagePercent = Math.min(Math.round((recentCallsPerMinute / RATE_LIMIT) * 100), 100);

  return (
    <div className="space-y-4">
      {/* Rate Limit Warning Banner */}
      {rateLimitWarning && !dismissedWarning && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 sm:p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-yellow-400">
              Approaching Rate Limit
            </p>
            <p className="text-xs text-yellow-500/80 mt-0.5">
              You've used {usagePercent}% of your rate limit ({recentCallsPerMinute}/{RATE_LIMIT} requests/min). 
              Slow down API calls to avoid being throttled.
            </p>
            <div className="mt-2 w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent >= 90 ? "bg-red-500" : "bg-yellow-500"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setDismissedWarning(true)}
            className="text-yellow-500/60 hover:text-yellow-400 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Gauge size={14} /> API Usage
        </h2>
        <span className="text-[10px] text-muted-foreground/60">
          Updated {lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Total Calls</p>
          <p className="text-lg sm:text-xl font-semibold">{totalCalls.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="text-lg sm:text-xl font-semibold">{todayCalls.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Rate (now)</p>
          <p className={`text-lg sm:text-xl font-semibold ${usagePercent >= 80 ? "text-yellow-400" : ""}`}>
            {recentCallsPerMinute}/min
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Top Endpoint</p>
          <p className="text-sm font-medium truncate">{topEndpoints[0]?.endpoint || "—"}</p>
        </div>
      </div>

      {/* Usage chart */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
          <TrendingUp size={12} /> API Calls (Last 14 days)
        </h3>
        <div className="h-40 sm:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyCalls}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
              <XAxis dataKey="date" stroke="hsl(0, 0%, 65%)" fontSize={11} />
              <YAxis stroke="hsl(0, 0%, 65%)" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 5%)",
                  border: "1px solid hsl(0, 0%, 20%)",
                  borderRadius: "8px",
                  color: "hsl(0, 0%, 100%)",
                }}
              />
              <Bar dataKey="count" name="API Calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top endpoints */}
      {topEndpoints.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
            <Activity size={12} /> Top Endpoints
          </h3>
          <div className="space-y-2">
            {topEndpoints.map((ep) => {
              const pct = Math.round((ep.count / totalCalls) * 100);
              return (
                <div key={ep.endpoint} className="flex items-center gap-3">
                  <code className="text-xs text-foreground truncate flex-1 min-w-0">{ep.endpoint}</code>
                  <div className="w-20 sm:w-32 h-2 rounded-full bg-secondary overflow-hidden shrink-0">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right shrink-0">{ep.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiUsageStats;
