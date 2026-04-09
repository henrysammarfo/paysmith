import { Wallet, ArrowUpRight, ArrowDownLeft, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Jan", volume: 4000 },
  { name: "Feb", volume: 3000 },
  { name: "Mar", volume: 5000 },
  { name: "Apr", volume: 4500 },
  { name: "May", volume: 6000 },
  { name: "Jun", volume: 5500 },
  { name: "Jul", volume: 7000 },
];

const stats = [
  { label: "Total Volume", value: "$35,000", icon: Activity, change: "+12.5%" },
  { label: "Active Wallets", value: "24", icon: Wallet, change: "+3" },
  { label: "Inflows", value: "$18,200", icon: ArrowDownLeft, change: "+8.1%" },
  { label: "Outflows", value: "$16,800", icon: ArrowUpRight, change: "+5.3%" },
];

const recentTxs = [
  { id: "tx_001", type: "receive", amount: "+$500.00", from: "MTN MoMo", time: "2 min ago" },
  { id: "tx_002", type: "pay", amount: "-$120.00", from: "Vodafone Cash", time: "15 min ago" },
  { id: "tx_003", type: "receive", amount: "+$1,200.00", from: "Bank Transfer", time: "1 hr ago" },
  { id: "tx_004", type: "pay", amount: "-$80.00", from: "USDC", time: "3 hr ago" },
  { id: "tx_005", type: "receive", amount: "+$320.00", from: "MTN MoMo", time: "5 hr ago" },
];

const Overview = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold">Overview</h1>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <s.icon size={18} className="text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{s.value}</div>
          <span className="text-xs text-emerald-400">{s.change}</span>
        </div>
      ))}
    </div>

    {/* Chart */}
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm text-muted-foreground mb-4">Transaction Volume</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 0%, 100%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(0, 0%, 100%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
            <XAxis dataKey="name" stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <YAxis stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 5%)",
                border: "1px solid hsl(0, 0%, 20%)",
                borderRadius: "8px",
                color: "hsl(0, 0%, 100%)",
              }}
            />
            <Area type="monotone" dataKey="volume" stroke="hsl(0, 0%, 100%)" fillOpacity={1} fill="url(#colorVol)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Recent Transactions */}
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm text-muted-foreground mb-4">Recent Transactions</h2>
      <div className="space-y-3">
        {recentTxs.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "receive" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                {tx.type === "receive" ? <ArrowDownLeft size={14} className="text-emerald-400" /> : <ArrowUpRight size={14} className="text-red-400" />}
              </div>
              <div>
                <p className="text-sm font-medium">{tx.from}</p>
                <p className="text-xs text-muted-foreground">{tx.time}</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${tx.type === "receive" ? "text-emerald-400" : "text-red-400"}`}>
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Overview;
