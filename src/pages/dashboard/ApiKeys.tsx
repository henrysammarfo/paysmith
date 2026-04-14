import { Key, Plus, Copy, Eye, EyeOff, Trash2, Globe, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WEBHOOK_EVENTS = [
  "payment.received",
  "payment.sent",
  "payment.failed",
  "wallet.created",
  "wallet.updated",
  "wallet.deleted",
];

const ApiKeys = () => {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [developer, setDeveloper] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Key modal
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState("live");
  const [creatingKey, setCreatingKey] = useState(false);

  // Add Webhook modal
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [savingWebhook, setSavingWebhook] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: dev } = await supabase
      .from("developers")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (dev) setDeveloper(dev);

    const { data: wData } = await supabase
      .from("agent_wallets")
      .select("id, name, api_key")
      .eq("owner_id", dev?.id);
    setWallets(wData || []);

    setLoading(false);
  };

  const toggleKey = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleEvent = (ev: string) => {
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  // Build display keys from developer data
  const displayKeys = developer
    ? [
        developer.live_api_key && {
          id: "live",
          name: "Live API Key",
          key: developer.live_api_key,
          created: new Date(developer.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        },
        developer.test_api_key && {
          id: "test",
          name: "Test API Key",
          key: developer.test_api_key,
          created: new Date(developer.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        },
      ].filter(Boolean)
    : [];

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    setCreatingKey(true);
    try {
      // Generate a new key and store as the appropriate type
      const prefix = newKeyEnv === "live" ? "ps_live_" : "ps_test_";
      const newKey = prefix + crypto.randomUUID().replace(/-/g, "");
      const field = newKeyEnv === "live" ? "live_api_key" : "test_api_key";

      const updateData: Record<string, string> = {};
      updateData[field] = newKey;
      const { error } = await supabase
        .from("developers")
        .update(updateData as any)
        .eq("id", developer.id);

      if (error) throw error;

      toast.success(`${newKeyName} key created!`, {
        description: "Your new API key is ready to use.",
      });
      (await import("@/lib/posthog")).analytics.track((await import("@/lib/posthog")).EVENTS.API_KEY_CREATED, { environment: newKeyEnv });
      setNewKeyOpen(false);
      setNewKeyName("");
      setNewKeyEnv("live");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to create key", { description: err.message });
    } finally {
      setCreatingKey(false);
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Select at least one event");
      return;
    }
    // Basic URL validation
    try {
      new URL(webhookUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setSavingWebhook(true);
    try {
      const secret = "whsec_" + crypto.randomUUID().replace(/-/g, "");

      const { error } = await supabase
        .from("developers")
        .update({ webhook_url: webhookUrl, webhook_secret: secret })
        .eq("id", developer.id);

      if (error) throw error;

      toast.success("Webhook configured!", {
        description: "Your endpoint will receive events.",
      });
      (await import("@/lib/posthog")).analytics.track((await import("@/lib/posthog")).EVENTS.WEBHOOK_CONFIGURED);
      setWebhookOpen(false);
      setWebhookUrl("");
      setSelectedEvents([]);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to save webhook", { description: err.message });
    } finally {
      setSavingWebhook(false);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return "••••••••••••";
    return key.slice(0, 8) + "••••••••" + key.slice(-4);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">API Keys & Webhooks</h1>
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-xl sm:text-2xl font-semibold">API Keys & Webhooks</h1>

      {/* API Keys */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">API Keys</h2>
          <Button onClick={() => setNewKeyOpen(true)} size="sm" className="rounded-xl gap-2">
            <Plus size={16} /> New Key
          </Button>
        </div>

        <div className="space-y-3">
          {displayKeys.map((k: any) => (
            <div key={k.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Key size={14} className="text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{k.name}</p>
                  <p className="text-xs text-muted-foreground">Created {k.created}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <code className="text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 truncate max-w-[160px]">
                  {visibleKeys.has(k.id) ? k.key : maskKey(k.key)}
                </code>
                <button onClick={() => toggleKey(k.id)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  {visibleKeys.has(k.id) ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copied!"); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Copy size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}

          {/* Wallet API keys */}
          {wallets.filter(w => w.api_key).map((w) => (
            <div key={w.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Key size={14} className="text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{w.name} Wallet Key</p>
                  <p className="text-xs text-muted-foreground">Wallet: {w.id.slice(0, 12)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <code className="text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 truncate max-w-[160px]">
                  {visibleKeys.has(w.id) ? w.api_key : maskKey(w.api_key)}
                </code>
                <button onClick={() => toggleKey(w.id)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  {visibleKeys.has(w.id) ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(w.api_key); toast.success("Copied!"); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Copy size={14} className="text-muted-foreground" />
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
          <Button onClick={() => setWebhookOpen(true)} size="sm" className="rounded-xl gap-2">
            <Plus size={16} /> Add Webhook
          </Button>
        </div>

        {developer?.webhook_url ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Globe size={14} className="text-muted-foreground shrink-0" />
                <code className="text-sm text-foreground truncate">{developer.webhook_url}</code>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">active</span>
            </div>
            {developer.webhook_secret && (
              <div className="flex items-center gap-2 mt-2">
                <code className="text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 truncate">
                  {visibleKeys.has("wh_secret") ? developer.webhook_secret : "whsec_••••••••••••"}
                </code>
                <button onClick={() => toggleKey("wh_secret")} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  {visibleKeys.has("wh_secret") ? <EyeOff size={12} className="text-muted-foreground" /> : <Eye size={12} className="text-muted-foreground" />}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(developer.webhook_secret); toast.success("Secret copied!"); }} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <Copy size={12} className="text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <Globe size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No webhook configured yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add one to receive real-time event notifications</p>
          </div>
        )}
      </div>

      {/* New Key Dialog */}
      <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g. Production, Staging"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={newKeyEnv} onValueChange={setNewKeyEnv}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {newKeyEnv === "live"
                  ? "This will replace your current live API key."
                  : "This will replace your current test API key."}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setNewKeyOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateKey} disabled={creatingKey}>
                {creatingKey ? "Creating..." : "Create Key"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={webhookOpen} onOpenChange={setWebhookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Webhook Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Endpoint URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://api.example.com/webhooks"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Events to subscribe</Label>
              <div className="flex flex-wrap gap-2">
                {WEBHOOK_EVENTS.map((ev) => (
                  <button
                    key={ev}
                    onClick={() => toggleEvent(ev)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedEvents.includes(ev)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {ev}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-secondary/30 p-3">
              <p className="text-xs text-muted-foreground">
                A signing secret will be generated automatically. Use it to verify webhook payloads.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setWebhookOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveWebhook} disabled={savingWebhook}>
                {savingWebhook ? "Saving..." : "Save Webhook"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeys;
