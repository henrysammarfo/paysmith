import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const COUNTRIES = [
  { value: "GH", label: "Ghana", currency: "GHS" },
  { value: "NG", label: "Nigeria", currency: "NGN" },
  { value: "US", label: "United States", currency: "USDC" },
];

const METHODS = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "crypto", label: "Crypto" },
];

const CreateWalletModal = ({ open, onOpenChange, onCreated }: Props) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("GH");
  const [methods, setMethods] = useState<string[]>(["mobile_money"]);
  const [dailyLimit, setDailyLimit] = useState(10000);
  const [maxSingleTx, setMaxSingleTx] = useState(2000);
  const [loading, setLoading] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.value === country)!;

  const toggleMethod = (m: string) => {
    setMethods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Wallet name is required");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      // Get developer's API key
      const { data: dev } = await supabase
        .from("developers")
        .select("test_api_key")
        .eq("auth_id", user.id)
        .single();

      if (!dev?.test_api_key) {
        toast.error("Developer record not found");
        setLoading(false);
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/agents-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": dev.test_api_key,
          },
          body: JSON.stringify({
            name: name.trim(),
            country,
            currency: selectedCountry.currency,
            paymentMethods: methods,
            spendingPolicy: {
              dailyLimit,
              maxSingleTx,
              requireApprovalAbove: dailyLimit,
            },
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to create wallet");
      } else {
        toast.success("Wallet created!");
        onCreated();
        onOpenChange(false);
        setName("");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Agent Wallet</DialogTitle>
          <DialogDescription>
            Set up a new wallet for your AI agent to process payments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-foreground">Wallet Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ghana MoMo Agent"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label} ({c.currency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Payment Methods</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggleMethod(m.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    methods.includes(m.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Daily Limit</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Max Single Tx</label>
              <input
                type="number"
                value={maxSingleTx}
                onChange={(e) => setMaxSingleTx(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Create Wallet
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWalletModal;
