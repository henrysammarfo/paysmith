import { Key, Plus, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const apiKeysData = [
  { id: "key_01", name: "Production", key: "pk_live_51N...x9Yz", created: "Mar 12, 2026", lastUsed: "2 min ago" },
  { id: "key_02", name: "Staging", key: "pk_test_8aB...k2Wq", created: "Feb 28, 2026", lastUsed: "1 day ago" },
  { id: "key_03", name: "Development", key: "pk_dev_3cD...m7Np", created: "Jan 15, 2026", lastUsed: "5 hr ago" },
];

const webhooks = [
  { id: "wh_01", url: "https://api.example.com/webhooks/paysmith", events: ["payment.received", "payment.sent"], status: "active" },
  { id: "wh_02", url: "https://staging.example.com/hooks", events: ["wallet.created"], status: "active" },
];

const ApiKeys = () => {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleKey = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">API Keys & Webhooks</h1>

      {/* API Keys */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">API Keys</h2>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors">
            <Plus size={16} /> New Key
          </button>
        </div>

        <div className="space-y-3">
          {apiKeysData.map((k) => (
            <div key={k.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Key size={14} className="text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{k.name}</p>
                  <p className="text-xs text-muted-foreground">Created {k.created} · Last used {k.lastUsed}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <code className="text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 hidden sm:block">
                  {visibleKeys.has(k.id) ? k.key : "••••••••••••"}
                </code>
                <button onClick={() => toggleKey(k.id)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  {visibleKeys.has(k.id) ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copied!"); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Copy size={14} className="text-muted-foreground" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Webhooks</h2>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors">
            <Plus size={16} /> Add Webhook
          </button>
        </div>

        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm text-foreground truncate">{wh.url}</code>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">{wh.status}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {wh.events.map((ev) => (
                  <span key={ev} className="text-xs bg-secondary rounded-md px-2 py-1 text-muted-foreground">{ev}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiKeys;
