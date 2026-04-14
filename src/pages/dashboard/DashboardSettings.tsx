import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

const DashboardSettings = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [webhookLoading, setWebhookLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load profile
    supabase
      .from("profiles")
      .select("full_name, company_name, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setCompanyName(data.company_name || "");
          setAvatarUrl(data.avatar_url || "");
        }
      });

    // Load webhook config from developers table
    supabase
      .from("developers")
      .select("webhook_url, webhook_secret")
      .eq("auth_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setWebhookUrl(data.webhook_url || "");
          setWebhookSecret(data.webhook_secret || "");
        }
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, company_name: companyName })
      .eq("user_id", user.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
    }
    setLoading(false);
  };

  const handleWebhookSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setWebhookLoading(true);
    const { error } = await supabase
      .from("developers")
      .update({ webhook_url: webhookUrl || null, webhook_secret: webhookSecret || null })
      .eq("auth_id", user.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Webhook settings saved!");
    }
    setWebhookLoading(false);
  };

  const generateSecret = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const secret = "whsec_" + Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
    setWebhookSecret(secret);
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const inputClass =
    "w-full rounded-xl bg-secondary/50 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Profile */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-medium mb-6">Profile</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-secondary text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{fullName || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Company Name</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full rounded-xl bg-secondary/30 border border-border px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Webhook Settings */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-medium mb-2">Webhook Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure a webhook URL to receive real-time notifications when transactions settle or fail.
        </p>
        <form onSubmit={handleWebhookSave} className="space-y-5">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/webhooks/paysmith"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Signing Secret</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showSecret ? "text" : "password"}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className={inputClass + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={generateSecret}
                className="rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Generate secret"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Used to sign webhook payloads with HMAC-SHA256. Click the refresh icon to generate a new secret.
            </p>
          </div>

          <div className="rounded-lg bg-secondary/30 border border-border p-4">
            <p className="text-sm font-medium mb-2">Supported Events</p>
            <div className="flex flex-wrap gap-2">
              {["transaction.settled", "transaction.failed"].map((evt) => (
                <span key={evt} className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono">
                  {evt}
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={webhookLoading}
            className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {webhookLoading ? "Saving..." : "Save Webhook Settings"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardSettings;
