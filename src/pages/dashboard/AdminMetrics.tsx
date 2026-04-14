import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { Loader2, Users, Wallet, ArrowUpDown, Activity, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyMetric {
  date: string;
  count: number;
}

const AdminMetrics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalDevs, setTotalDevs] = useState(0);
  const [totalWallets, setTotalWallets] = useState(0);
  const [totalTxns, setTotalTxns] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [activeDevs, setActiveDevs] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [retentionRate, setRetentionRate] = useState(0);
  const [signupsByDay, setSignupsByDay] = useState<DailyMetric[]>([]);
  const [volumeByDay, setVolumeByDay] = useState<DailyMetric[]>([]);
  const [apiCallsByDay, setApiCallsByDay] = useState<DailyMetric[]>([]);
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadMetrics = useCallback(async () => {
    if (!user) return;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const admin = roleData?.some((r) => r.role === "admin") ?? false;
    setIsAdmin(admin);

    // All devs can see their own metrics; admins see global
    const { data: allDevs } = await supabase.from("developers").select("id, created_at, auth_id");
    const devs = admin ? allDevs : allDevs?.filter((d) => d.auth_id === user.id);
    setTotalDevs(devs?.length ?? 0);

    const devIds = devs?.map((d) => d.id) ?? [];
    if (devIds.length === 0) { setLoading(false); return; }

    // Wallets
    const { data: wallets } = await supabase
      .from("agent_wallets")
      .select("id, owner_id, status, created_at")
      .in("owner_id", devIds);
    setTotalWallets(wallets?.length ?? 0);

    const walletIds = wallets?.map((w) => w.id) ?? [];

    // Transactions
    if (walletIds.length > 0) {
      const { data: txns } = await supabase
        .from("transactions")
        .select("amount, fee, created_at, agent_wallet_id")
        .in("agent_wallet_id", walletIds)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (txns) {
        setTotalTxns(txns.length);
        setTotalVolume(txns.reduce((s, t) => s + Number(t.amount), 0));

        // Volume by day
        const byDay: Record<string, number> = {};
        for (const t of txns) {
          const day = new Date(t.created_at).toISOString().slice(0, 10);
          byDay[day] = (byDay[day] || 0) + Number(t.amount);
        }
        setVolumeByDay(
          Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            count,
          }))
        );
      }

      // Active devs (devs with txns in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentTxns } = await supabase
        .from("transactions")
        .select("agent_wallet_id")
        .in("agent_wallet_id", walletIds)
        .gte("created_at", thirtyDaysAgo);

      if (recentTxns && wallets) {
        const activeWalletIds = new Set(recentTxns.map((t) => t.agent_wallet_id));
        const activeOwnerIds = new Set(
          wallets.filter((w) => activeWalletIds.has(w.id)).map((w) => w.owner_id)
        );
        setActiveDevs(activeOwnerIds.size);
      }
    }

    // Signups by day
    if (devs) {
      const byDay: Record<string, number> = {};
      for (const d of devs) {
        const day = new Date(d.created_at).toISOString().slice(0, 10);
        byDay[day] = (byDay[day] || 0) + 1;
      }
      setSignupsByDay(
        Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count,
        }))
      );

      // Growth rate (this week vs last week signups)
      const now = Date.now();
      const thisWeek = devs.filter((d) => now - new Date(d.created_at).getTime() < 7 * 24 * 60 * 60 * 1000).length;
      const lastWeek = devs.filter((d) => {
        const age = now - new Date(d.created_at).getTime();
        return age >= 7 * 24 * 60 * 60 * 1000 && age < 14 * 24 * 60 * 60 * 1000;
      }).length;
      setGrowthRate(lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0);
    }

    // Retention (devs who signed up > 7 days ago and are still active)
    if (devs && wallets) {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const earlyDevs = devs.filter((d) => new Date(d.created_at).getTime() < sevenDaysAgo);
      if (earlyDevs.length > 0) {
        const earlyDevIds = new Set(earlyDevs.map((d) => d.id));
        const retainedCount = wallets.filter((w) => earlyDevIds.has(w.owner_id)).length > 0
          ? earlyDevs.filter((d) => wallets.some((w) => w.owner_id === d.id)).length
          : 0;
        setRetentionRate(Math.round((retainedCount / earlyDevs.length) * 100));
      }
    }

    // API calls by day
    const { data: apiLogs } = await supabase
      .from("api_call_logs")
      .select("created_at")
      .in("developer_id", devIds)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (apiLogs) {
      const byDay: Record<string, number> = {};
      for (const l of apiLogs) {
        const day = new Date(l.created_at).toISOString().slice(0, 10);
        byDay[day] = (byDay[day] || 0) + 1;
      }
      setApiCallsByDay(
        Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count,
        }))
      );
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await supabase.functions.invoke("generate-traction-report", {
        body: {
          totalDevs,
          totalWallets,
          totalTxns,
          totalVolume,
          activeDevs,
          growthRate,
          retentionRate,
          signupsByDay,
          volumeByDay,
        },
      });

      if (res.error) throw res.error;

      // Download the PDF
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `paysmith-traction-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("PDF export error:", err);
      // Fallback: generate a simple text report as downloadable
      const report = generateTextReport();
      const blob = new Blob([report], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `paysmith-traction-report-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExportingPdf(false);
  };

  const generateTextReport = () => {
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    return `
╔══════════════════════════════════════════════════╗
║           PAYSMITH TRACTION REPORT               ║
║           ${date}                    ║
╚══════════════════════════════════════════════════╝

EXECUTIVE SUMMARY
─────────────────
Paysmith is an AI-native payment infrastructure platform enabling 
autonomous agents to send, receive, and manage money across Africa.

KEY METRICS
─────────────────
Total Developers Signed Up:    ${totalDevs}
Active Developers (30d):       ${activeDevs}
Total Agent Wallets:           ${totalWallets}
Total Transactions:            ${totalTxns.toLocaleString()}
Total Volume Processed:        $${totalVolume.toLocaleString()}
Week-over-Week Growth:         ${growthRate >= 0 ? "+" : ""}${growthRate}%
Developer Retention (7d+):     ${retentionRate}%

GROWTH TRAJECTORY
─────────────────
${signupsByDay.map((d) => `  ${d.date}: ${d.count} new developers`).join("\n")}

VOLUME TRAJECTORY
─────────────────
${volumeByDay.map((d) => `  ${d.date}: $${d.count.toLocaleString()}`).join("\n")}

─────────────────
Generated by Paysmith Analytics
    `.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const stats = [
    { label: "Total Developers", value: totalDevs, icon: Users, sub: `${activeDevs} active (30d)` },
    { label: "Agent Wallets", value: totalWallets, icon: Wallet, sub: "" },
    { label: "Total Transactions", value: totalTxns.toLocaleString(), icon: ArrowUpDown, sub: `$${totalVolume.toLocaleString()} volume` },
    { label: "WoW Growth", value: `${growthRate >= 0 ? "+" : ""}${growthRate}%`, icon: TrendingUp, sub: `${retentionRate}% retention` },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Metrics & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Platform-wide metrics" : "Your developer metrics"}
          </p>
        </div>
        <Button
          onClick={handleExportPdf}
          disabled={exportingPdf}
          variant="outline"
          className="rounded-xl gap-2"
        >
          <Download size={16} />
          {exportingPdf ? "Exporting..." : "Export Traction Report"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <s.icon size={16} className="text-muted-foreground" />
            </div>
            <div className="text-lg sm:text-2xl font-semibold">{s.value}</div>
            <span className="text-xs text-muted-foreground">{s.label}</span>
            {s.sub && <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Developer Signups Chart */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm text-muted-foreground mb-4">Developer Signups Over Time</h2>
        <div className="h-48 sm:h-64">
          {signupsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupsByDay}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                <XAxis dataKey="date" stroke="hsl(0, 0%, 65%)" fontSize={12} />
                <YAxis stroke="hsl(0, 0%, 65%)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 5%)", border: "1px solid hsl(0, 0%, 20%)", borderRadius: "8px", color: "hsl(0, 0%, 100%)" }} />
                <Area type="monotone" dataKey="count" name="Signups" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No signup data yet</div>
          )}
        </div>
      </div>

      {/* Volume + API Calls Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-sm text-muted-foreground mb-4">Transaction Volume</h2>
          <div className="h-44 sm:h-56">
            {volumeByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis dataKey="date" stroke="hsl(0, 0%, 65%)" fontSize={11} />
                  <YAxis stroke="hsl(0, 0%, 65%)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 5%)", border: "1px solid hsl(0, 0%, 20%)", borderRadius: "8px", color: "hsl(0, 0%, 100%)" }} />
                  <Bar dataKey="count" name="Volume ($)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No volume data yet</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-sm text-muted-foreground mb-4">API Calls</h2>
          <div className="h-44 sm:h-56">
            {apiCallsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={apiCallsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis dataKey="date" stroke="hsl(0, 0%, 65%)" fontSize={11} />
                  <YAxis stroke="hsl(0, 0%, 65%)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 5%)", border: "1px solid hsl(0, 0%, 20%)", borderRadius: "8px", color: "hsl(0, 0%, 100%)" }} />
                  <Line type="monotone" dataKey="count" name="API Calls" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No API call data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Retention & Activity */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm text-muted-foreground mb-4">Key Ratios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <div className="text-2xl sm:text-3xl font-bold">{retentionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">7-Day Retention</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <div className="text-2xl sm:text-3xl font-bold">{totalDevs > 0 ? (totalWallets / totalDevs).toFixed(1) : "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">Wallets per Dev</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <div className="text-2xl sm:text-3xl font-bold">{totalTxns > 0 && totalDevs > 0 ? Math.round(totalTxns / totalDevs) : "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">Txns per Dev</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMetrics;
