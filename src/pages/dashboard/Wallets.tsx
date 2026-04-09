import { Wallet, Plus, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const wallets = [
  { id: "agt_01", name: "Delivery Bot", balance: "$2,340.00", rail: "MTN MoMo", status: "active", address: "0x7f3a...e29b" },
  { id: "agt_02", name: "Support Agent", balance: "$890.50", rail: "Vodafone Cash", status: "active", address: "0x4c1b...a8d2" },
  { id: "agt_03", name: "Payment Processor", balance: "$5,120.00", rail: "Bank Transfer", status: "active", address: "0x9e2f...c3a1" },
  { id: "agt_04", name: "Refund Handler", balance: "$450.00", rail: "USDC", status: "paused", address: "0x2d8c...f7e4" },
];

const Wallets = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Wallets</h1>
      <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors">
        <Plus size={16} /> New Wallet
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {wallets.map((w) => (
        <div key={w.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Wallet size={18} className="text-foreground" />
              </div>
              <div>
                <h3 className="font-medium">{w.name}</h3>
                <p className="text-xs text-muted-foreground">{w.rail}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${w.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
              {w.status}
            </span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-xl font-semibold">{w.balance}</p>
          </div>

          <div className="flex items-center gap-2">
            <code className="text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 flex-1 truncate">{w.address}</code>
            <button onClick={() => { navigator.clipboard.writeText(w.address); toast.success("Copied!"); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <Copy size={14} className="text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <ExternalLink size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Wallets;
