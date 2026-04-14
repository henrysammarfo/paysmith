import { useEffect, useState, useCallback } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Activity, Loader2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import OnboardingWizard from "@/components/OnboardingWizard";

interface DailyStat {
  date: string;
  volume: number;
  revenue: number;
  txCount: number;
}

const Overview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [activeWallets, setActiveWallets] = useState(0);
  const [totalTxns, setTotalTxns] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [walletIds, setWalletIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;

    const { data: dev } = await supabase
      .from("developers")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!dev) { setLoading(false); return; }

    const { data: wallets } = await supabase
      .from("agent_wallets")
      .select("id, status, total_volume, total_txns")
      .eq("owner_id", dev.id);

    const ids = wallets?.map((w) => w.id) ?? [];
    setWalletIds(ids);
    setActiveWallets(wallets?.filter((w) => w.status === "active").length ?? 0);
    setTotalVolume(wallets?.reduce((s, w) => s + Number(w.total_volume ?? 0), 0) ?? 0);
    setTotalTxns(wallets?.reduce((s, w) => s + Number(w.total_txns ?? 0), 0) ?? 0);

    if (ids.length === 0) { setShowOnboarding(true); setLoading(false); return; }

    const { data: txns } = await supabase
      .from("transactions")
      .select("amount, fee, created_at, type, method, recipient, currency")
      .in("agent_wallet_id", ids)
      .order("created_at", { ascending: false })
      .limit(500);

    if (txns && txns.length > 0) {
      setTotalFees(txns.reduce((s, t) => s + Number(t.fee ?? 0), 0));

      const byDay: Record<string, { volume: number; revenue: number; txCount: number }> = {};
      for (const t of txns) {
        const day = new Date(t.created_at).toISOString().slice(0, 10);
        if (!byDay[day]) byDay[day] = { volume: 0, revenue: 0, txCount: 0 };
        byDay[day].volume += Number(t.amount);
        byDay[day].revenue += Number(t.fee ?? 0);
        byDay[day].txCount += 1;
      }

      setDailyStats(
        Object.entries(byDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, d]) => ({
            date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            ...d,
          }))
      );

      setRecentTxs(txns.slice(0, 5));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime subscription for live updates
  useEffect(() => {
    if (walletIds.length === 0) return;

    const channel = supabase
      .channel("overview-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          const newTx = payload.new as any;
          if (!walletIds.includes(newTx.agent_wallet_id)) return;

          // Update recent transactions
          setRecentTxs((prev) => [newTx, ...prev].slice(0, 5));
          setTotalTxns((prev) => prev + 1);
          setTotalVolume((prev) => prev + Number(newTx.amount));
          setTotalFees((prev) => prev + Number(newTx.fee ?? 0));

          // Update daily stats
          const day = new Date(newTx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          setDailyStats((prev) => {
            const existing = prev.find((d) => d.date === day);
            if (existing) {
              return prev.map((d) =>
                d.date === day
                  ? { ...d, volume: d.volume + Number(newTx.amount), revenue: d.revenue + Number(newTx.fee ?? 0), txCount: d.txCount + 1 }
                  : d
              );
            }
            return [...prev, { date: day, volume: Number(newTx.amount), revenue: Number(newTx.fee ?? 0), txCount: 1 }];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [walletIds]);

  const currencySymbol = (c: string) => {
    if (c === "GHS") return "₵";
    if (c === "NGN") return "₦";
    return "$";
  };

  const stats = [
    { label: "Total Volume", value: `$${totalVolume.toLocaleString()}`, icon: Activity, change: `${totalTxns} txns` },
    { label: "Active Wallets", value: activeWallets.toString(), icon: Wallet, change: "" },
    { label: "Revenue (Fees)", value: `$${totalFees.toFixed(2)}`, icon: ArrowDownLeft, change: "" },
    { label: "Total Transactions", value: totalTxns.toLocaleString(), icon: ArrowUpRight, change: "" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingWizard onComplete={() => { setShowOnboarding(false); loadData(); }} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon size={18} className="text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{s.value}</div>
            {s.change && <span className="text-xs text-muted-foreground">{s.change}</span>}
          </div>
        ))}
      </div>

      {/* Volume Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm text-muted-foreground mb-4">Transaction Volume</h2>
        <div className="h-64">
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                <XAxis dataKey="date" stroke="hsl(0, 0%, 65%)" fontSize={12} />
                <YAxis stroke="hsl(0, 0%, 65%)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 5%)", border: "1px solid hsl(0, 0%, 20%)", borderRadius: "8px", color: "hsl(0, 0%, 100%)" }} />
                <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No transaction data yet</div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm text-muted-foreground mb-4">Revenue (Fees Earned)</h2>
        <div className="h-56">
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                <XAxis dataKey="date" stroke="hsl(0, 0%, 65%)" fontSize={12} />
                <YAxis stroke="hsl(0, 0%, 65%)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 5%)", border: "1px solid hsl(0, 0%, 20%)", borderRadius: "8px", color: "hsl(0, 0%, 100%)" }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No revenue data yet</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm text-muted-foreground mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {recentTxs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No transactions yet</p>
          ) : (
            recentTxs.map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "receive" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {tx.type === "receive" ? <ArrowDownLeft size={14} className="text-emerald-400" /> : <ArrowUpRight size={14} className="text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {tx.recipient || tx.method?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${tx.type === "receive" ? "text-emerald-400" : "text-red-400"}`}>
                  {tx.type === "receive" ? "+" : "-"}{currencySymbol(tx.currency)}{Number(tx.amount).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
