import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Loader2, Zap, TrendingUp, Activity, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ApiLog {
  endpoint: string;
  method: string;
  status_code: number | null;
  created_at: string;
}

const PRESET_RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(48, 96%, 53%)",
  "hsl(280, 67%, 55%)",
  "hsl(12, 76%, 61%)",
  "hsl(199, 89%, 48%)",
];

const ApiUsage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [endpointFilter, setEndpointFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: dev } = await supabase
        .from("developers")
        .select("id")
        .eq("auth_id", user.id)
        .single();
      if (!dev) { setLoading(false); return; }

      const { data } = await supabase
        .from("api_call_logs")
        .select("endpoint, method, status_code, created_at")
        .eq("developer_id", dev.id)
        .gte("created_at", dateFrom.toISOString())
        .lte("created_at", dateTo.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);

      setLogs((data as ApiLog[]) || []);
      setLoading(false);
    };
    load();
  }, [user, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    if (endpointFilter === "all") return logs;
    return logs.filter((l) => l.endpoint === endpointFilter);
  }, [logs, endpointFilter]);

  const allEndpoints = useMemo(() => {
    const set = new Set(logs.map((l) => l.endpoint));
    return Array.from(set).sort();
  }, [logs]);

  // Daily aggregation
  const dailyData = useMemo(() => {
    const byDay: Record<string, { total: number; success: number; errors: number }> = {};
    for (const l of filtered) {
      const day = l.created_at.slice(0, 10);
      if (!byDay[day]) byDay[day] = { total: 0, success: 0, errors: 0 };
      byDay[day].total += 1;
      if (l.status_code && l.status_code >= 400) byDay[day].errors += 1;
      else byDay[day].success += 1;
    }
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date: format(new Date(date), "MMM d"),
        ...d,
      }));
  }, [filtered]);

  // Endpoint breakdown for pie
  const endpointBreakdown = useMemo(() => {
    const byEndpoint: Record<string, number> = {};
    for (const l of filtered) {
      byEndpoint[l.endpoint] = (byEndpoint[l.endpoint] || 0) + 1;
    }
    return Object.entries(byEndpoint)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }, [filtered]);

  // Method breakdown
  const methodBreakdown = useMemo(() => {
    const byMethod: Record<string, number> = {};
    for (const l of filtered) {
      byMethod[l.method] = (byMethod[l.method] || 0) + 1;
    }
    return Object.entries(byMethod)
      .sort(([, a], [, b]) => b - a)
      .map(([method, count]) => ({ method, count }));
  }, [filtered]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    let success = 0, clientErr = 0, serverErr = 0;
    for (const l of filtered) {
      if (!l.status_code || l.status_code < 400) success++;
      else if (l.status_code < 500) clientErr++;
      else serverErr++;
    }
    return { success, clientErr, serverErr };
  }, [filtered]);

  const errorRate = filtered.length > 0
    ? ((statusBreakdown.clientErr + statusBreakdown.serverErr) / filtered.length * 100).toFixed(1)
    : "0";

  const avgDaily = dailyData.length > 0
    ? Math.round(filtered.length / dailyData.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
          <Zap size={20} /> API Usage
        </h1>

        {/* Date range */}
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_RANGES.map((r) => (
            <Button
              key={r.label}
              size="sm"
              variant={
                Math.round((dateTo.getTime() - dateFrom.getTime()) / 86400000) === r.days
                  ? "default"
                  : "outline"
              }
              className="text-xs h-7"
              onClick={() => {
                setDateFrom(subDays(new Date(), r.days));
                setDateTo(new Date());
              }}
            >
              {r.label}
            </Button>
          ))}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                <CalendarIcon size={12} />
                {format(dateFrom, "MMM d")} – {format(dateTo, "MMM d")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateFrom, to: dateTo }}
                onSelect={(range) => {
                  if (range?.from) setDateFrom(range.from);
                  if (range?.to) setDateTo(range.to);
                }}
                numberOfMonths={1}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Endpoint filter */}
      {allEndpoints.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-muted-foreground" />
          <Button
            size="sm"
            variant={endpointFilter === "all" ? "default" : "outline"}
            className="text-xs h-7"
            onClick={() => setEndpointFilter("all")}
          >
            All
          </Button>
          {allEndpoints.map((ep) => (
            <Button
              key={ep}
              size="sm"
              variant={endpointFilter === ep ? "default" : "outline"}
              className="text-xs h-7"
              onClick={() => setEndpointFilter(ep)}
            >
              {ep}
            </Button>
          ))}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Total Calls</p>
          <p className="text-xl sm:text-2xl font-semibold">{filtered.length.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Avg / Day</p>
          <p className="text-xl sm:text-2xl font-semibold">{avgDaily.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Error Rate</p>
          <p className="text-xl sm:text-2xl font-semibold">{errorRate}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Endpoints</p>
          <p className="text-xl sm:text-2xl font-semibold">{allEndpoints.length}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <Zap size={40} className="mx-auto text-muted-foreground" />
          <h3 className="font-medium text-lg">No API calls yet</h3>
          <p className="text-sm text-muted-foreground">
            API usage data will appear here once your keys start making requests.
          </p>
        </div>
      ) : (
        <>
          {/* Daily usage chart */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
              <TrendingUp size={14} /> Daily API Calls
            </h2>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="total" name="Total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCalls)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Success vs errors bar chart */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="text-sm text-muted-foreground mb-4">Success vs Errors</h2>
            <div className="h-40 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
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
                  <Bar dataKey="success" name="Success" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="errors" name="Errors" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Endpoint breakdown */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h2 className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                <Activity size={14} /> Endpoint Breakdown
              </h2>
              <div className="space-y-3">
                {endpointBreakdown.map((ep, i) => {
                  const pct = Math.round((ep.count / filtered.length) * 100);
                  return (
                    <div key={ep.endpoint} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <code className="text-foreground truncate">{ep.endpoint}</code>
                        <span className="text-muted-foreground ml-2 shrink-0">{ep.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Method & Status breakdown */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-6">
              <div>
                <h2 className="text-sm text-muted-foreground mb-3">By Method</h2>
                <div className="flex flex-wrap gap-2">
                  {methodBreakdown.map((m) => (
                    <div key={m.method} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
                      <p className="text-xs font-mono font-medium text-foreground">{m.method}</p>
                      <p className="text-lg font-semibold">{m.count}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm text-muted-foreground mb-3">Response Status</h2>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">2xx</p>
                    <p className="text-lg font-semibold text-emerald-400">{statusBreakdown.success}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">4xx</p>
                    <p className="text-lg font-semibold text-yellow-400">{statusBreakdown.clientErr}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">5xx</p>
                    <p className="text-lg font-semibold text-red-400">{statusBreakdown.serverErr}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent calls table */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="text-sm text-muted-foreground mb-4">Recent Calls</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Endpoint</th>
                    <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Method</th>
                    <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="py-2 text-xs font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 20).map((l, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4">
                        <code className="text-xs text-foreground">{l.endpoint}</code>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-secondary text-foreground">
                          {l.method}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs font-medium ${
                          !l.status_code || l.status_code < 400
                            ? "text-emerald-400"
                            : l.status_code < 500
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}>
                          {l.status_code || "—"}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(l.created_at), "MMM d, HH:mm:ss")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApiUsage;
