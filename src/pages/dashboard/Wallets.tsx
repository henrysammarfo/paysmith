import { useEffect, useState } from "react";
import { Wallet, Plus, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AgentWallet {
  id: string;
  name: string;
  country: string;
  currency: string;
  status: string;
  balance_ghs: number;
  balance_ngn: number;
  balance_usdc: number;
  payment_methods: string[];
  spending_policy: Record<string, number>;
  total_volume: number;
  total_txns: number;
  created_at: string;
}

const Wallets = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<AgentWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchWallets = async () => {
      // First get the developer record for this user
      const { data: dev } = await supabase
        .from("developers")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!dev) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("agent_wallets")
        .select("*")
        .eq("owner_id", dev.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setWallets(data as unknown as AgentWallet[]);
      }
      setLoading(false);
    };

    fetchWallets();
  }, [user]);

  const formatBalance = (w: AgentWallet) => {
    if (w.currency === "GHS") return `₵${Number(w.balance_ghs).toLocaleString()}`;
    if (w.currency === "NGN") return `₦${Number(w.balance_ngn).toLocaleString()}`;
    if (w.currency === "USDC") return `$${Number(w.balance_usdc).toLocaleString()}`;
    return `${Number(w.balance_ghs).toLocaleString()} ${w.currency}`;
  };

  const getRailLabel = (methods: string[]) => {
    if (!methods || methods.length === 0) return "No rail";
    return methods[0].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wallets</h1>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors">
          <Plus size={16} /> New Wallet
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : wallets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <Wallet size={40} className="mx-auto text-muted-foreground" />
          <h3 className="font-medium text-lg">No wallets yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first agent wallet to start processing payments.
          </p>
        </div>
      ) : (
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
                    <p className="text-xs text-muted-foreground">
                      {getRailLabel(w.payment_methods)} · {w.country}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    w.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : w.status === "paused"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {w.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-xl font-semibold">{formatBalance(w)}</p>
              </div>

              <div className="flex items-center gap-2">
                <code className="text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 flex-1 truncate">
                  {w.id}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(w.id);
                    toast.success("Copied!");
                  }}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Copy size={14} className="text-muted-foreground" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <ExternalLink size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wallets;
