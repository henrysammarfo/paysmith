import { useEffect, useState } from "react";
import { ArrowUpDown, Filter, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  agent_wallet_id: string;
  type: string;
  recipient: string | null;
  amount: number;
  currency: string;
  method: string;
  status: string;
  fee: number | null;
  note: string | null;
  rail_tx_id: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  settled: "bg-emerald-500/10 text-emerald-400",
  pending: "bg-yellow-500/10 text-yellow-400",
  failed: "bg-red-500/10 text-red-400",
};

const Transactions = () => {
  const { user } = useAuth();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const { data: dev } = await supabase
        .from("developers")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!dev) {
        setLoading(false);
        return;
      }

      const { data: wallets } = await supabase
        .from("agent_wallets")
        .select("id")
        .eq("owner_id", dev.id);

      if (!wallets || wallets.length === 0) {
        setLoading(false);
        return;
      }

      const walletIds = wallets.map((w) => w.id);

      let query = supabase
        .from("transactions")
        .select("*")
        .in("agent_wallet_id", walletIds)
        .order("created_at", { ascending: false })
        .limit(200);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (methodFilter !== "all") {
        query = query.eq("method", methodFilter);
      }

      const { data, error } = await query;
      if (!error && data) {
        setTxns(data as unknown as Transaction[]);
      }
      setLoading(false);
    };

    fetch();
  }, [user, statusFilter, methodFilter]);

  const filtered = txns.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.recipient?.toLowerCase().includes(s) ||
      t.rail_tx_id?.toLowerCase().includes(s) ||
      t.note?.toLowerCase().includes(s) ||
      t.agent_wallet_id.toLowerCase().includes(s)
    );
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const currencySymbol = (c: string) => {
    if (c === "GHS") return "₵";
    if (c === "NGN") return "₦";
    if (c === "USDC" || c === "USD") return "$";
    return c + " ";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold">Transactions</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient, tx ID, note…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground"
        >
          <option value="all">All Statuses</option>
          <option value="settled">Settled</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground"
        >
          <option value="all">All Methods</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="crypto">Crypto</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <ArrowUpDown size={40} className="mx-auto text-muted-foreground" />
          <h3 className="font-medium text-lg">No transactions found</h3>
          <p className="text-sm text-muted-foreground">
            Transactions will appear here once payments are processed through your wallets.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead className="hidden lg:table-cell">TX ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(t.created_at)}
                  </TableCell>
                  <TableCell className="capitalize text-sm">{t.type}</TableCell>
                  <TableCell className="text-sm truncate max-w-[140px]">
                    {t.recipient || "—"}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {currencySymbol(t.currency)}
                    {Number(t.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs">
                    {t.method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        STATUS_COLORS[t.status] || "bg-secondary text-foreground"
                      }`}
                    >
                      {t.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.fee != null ? `${currencySymbol(t.currency)}${Number(t.fee).toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <code className="text-xs text-muted-foreground">{t.rail_tx_id || "—"}</code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
