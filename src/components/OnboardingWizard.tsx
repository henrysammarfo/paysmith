import { useState, useEffect } from "react";
import { Check, Wallet, Key, Webhook, Copy, Eye, EyeOff, ChevronRight, RefreshCw, Sparkles, Code, Play, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { analytics, EVENTS } from "@/lib/posthog";
import { Progress } from "@/components/ui/progress";

type SnippetLang = "curl" | "node" | "python";

const CodeSnippet = ({ code, lang }: { code: string; lang: string }) => (
  <div className="relative group">
    <pre className="rounded-lg bg-secondary/50 border border-border p-3 text-xs overflow-x-auto">
      <code className="text-foreground">{code}</code>
    </pre>
    <button
      onClick={() => { navigator.clipboard.writeText(code); toast.success("Code copied!"); }}
      className="absolute top-2 right-2 p-1 rounded bg-secondary hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Copy size={12} className="text-muted-foreground" />
    </button>
  </div>
);

const SnippetTabs = ({ testKey, walletId, showTryLive }: { testKey: string; walletId?: string; showTryLive?: boolean }) => {
  const [lang, setLang] = useState<SnippetLang>("curl");
  const [trying, setTrying] = useState(false);
  const [tryResult, setTryResult] = useState<any>(null);
  const [tryError, setTryError] = useState<string | null>(null);
  const wId = walletId || "ps_agent_xxxxxx";
  const maskedKey = testKey ? testKey.slice(0, 12) + "..." : "ps_test_xxxxx";
  const apiUrl = import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
    : "https://api.paysmith.dev/v1";

  const snippets: Record<SnippetLang, string> = {
    curl: `curl -X POST ${apiUrl}/pay \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ${maskedKey}" \\
  -d '{
    "walletId": "${wId}",
    "amount": 500,
    "currency": "NGN",
    "method": "mobile_money",
    "recipient": "+2348012345678",
    "note": "Test payment"
  }'`,
    node: `const response = await fetch(
  "${apiUrl}/pay",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": "${maskedKey}",
    },
    body: JSON.stringify({
      walletId: "${wId}",
      amount: 500,
      currency: "NGN",
      method: "mobile_money",
      recipient: "+2348012345678",
      note: "Test payment",
    }),
  }
);

const data = await response.json();
console.log(data);`,
    python: `import requests

response = requests.post(
    "${apiUrl}/pay",
    headers={
        "Content-Type": "application/json",
        "X-API-KEY": "${maskedKey}",
    },
    json={
        "walletId": "${wId}",
        "amount": 500,
        "currency": "NGN",
        "method": "mobile_money",
        "recipient": "+2348012345678",
        "note": "Test payment",
    },
)

print(response.json())`,
  };

  const handleTryLive = async () => {
    if (!testKey || !walletId) {
      toast.error("Create a wallet first to try a live payment");
      return;
    }
    setTrying(true);
    setTryResult(null);
    setTryError(null);
    try {
      const { data, error } = await supabase.functions.invoke("pay", {
        headers: { "x-api-key": testKey },
        body: {
          walletId: wId,
          amount: 500,
          currency: "NGN",
          method: "mobile_money",
          to: "+2348012345678",
          note: "Test payment from onboarding",
        },
      });
      if (error) throw error;
      setTryResult(data);
      toast.success("Test payment sent!");
    } catch (err: any) {
      setTryError(err.message || "Request failed");
    } finally {
      setTrying(false);
    }
  };

  const tabs: { id: SnippetLang; label: string }[] = [
    { id: "curl", label: "cURL" },
    { id: "node", label: "Node.js" },
    { id: "python", label: "Python" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-secondary/30 p-0.5 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setLang(t.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                lang === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {showTryLive && (
          <button
            onClick={handleTryLive}
            disabled={trying || !walletId}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-xs font-medium hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
          >
            {trying ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
            Try it live
          </button>
        )}
      </div>
      <CodeSnippet code={snippets[lang]} lang={lang} />
      {tryResult && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1">
          <p className="text-xs font-medium text-emerald-400 flex items-center gap-1"><Check size={12} /> Response</p>
          <pre className="text-xs text-foreground overflow-x-auto">{JSON.stringify(tryResult, null, 2)}</pre>
        </div>
      )}
      {tryError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs text-destructive">{tryError}</p>
        </div>
      )}
    </div>
  );
};

const WalletCreationSnippets = ({ testKey }: { testKey: string }) => {
  const [lang, setLang] = useState<SnippetLang>("curl");
  const maskedKey = testKey ? testKey.slice(0, 12) + "..." : "ps_test_xxxxx";
  const apiUrl = import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
    : "https://api.paysmith.dev/v1";

  const snippets: Record<SnippetLang, string> = {
    curl: `curl -X POST ${apiUrl}/agents-create \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ${maskedKey}" \\
  -d '{
    "name": "Payment Bot",
    "country": "NG",
    "currency": "NGN",
    "paymentMethods": ["mobile_money", "bank_transfer"],
    "spendingPolicy": {
      "dailyLimit": 10000,
      "maxSingleTx": 2000,
      "requireApprovalAbove": 5000
    }
  }'`,
    node: `const response = await fetch(
  "${apiUrl}/agents-create",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": "${maskedKey}",
    },
    body: JSON.stringify({
      name: "Payment Bot",
      country: "NG",
      currency: "NGN",
      paymentMethods: ["mobile_money", "bank_transfer"],
      spendingPolicy: {
        dailyLimit: 10000,
        maxSingleTx: 2000,
        requireApprovalAbove: 5000,
      },
    }),
  }
);

const wallet = await response.json();
console.log(wallet.walletId, wallet.apiKey);`,
    python: `import requests

response = requests.post(
    "${apiUrl}/agents-create",
    headers={
        "Content-Type": "application/json",
        "X-API-KEY": "${maskedKey}",
    },
    json={
        "name": "Payment Bot",
        "country": "NG",
        "currency": "NGN",
        "paymentMethods": ["mobile_money", "bank_transfer"],
        "spendingPolicy": {
            "dailyLimit": 10000,
            "maxSingleTx": 2000,
            "requireApprovalAbove": 5000,
        },
    },
)

wallet = response.json()
print(wallet["walletId"], wallet["apiKey"])`,
  };

  const tabs: { id: SnippetLang; label: string }[] = [
    { id: "curl", label: "cURL" },
    { id: "node", label: "Node.js" },
    { id: "python", label: "Python" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 rounded-lg bg-secondary/30 p-0.5 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setLang(t.id)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              lang === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeSnippet code={snippets[lang]} lang={lang} />
    </div>
  );
};

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { id: "wallet", title: "Create Your First Wallet", description: "Set up an agent wallet to start processing payments", icon: <Wallet size={20} />, completed: false },
    { id: "api-keys", title: "Get Your API Keys", description: "Copy your API keys to integrate Paysmith into your app", icon: <Key size={20} />, completed: false },
    { id: "webhook", title: "Configure Webhooks", description: "Set up a webhook URL to receive transaction notifications", icon: <Webhook size={20} />, completed: false },
  ]);

  // Wallet creation state
  const [walletName, setWalletName] = useState("");
  const [walletCountry, setWalletCountry] = useState("NG");
  const [walletLoading, setWalletLoading] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<any>(null);

  // API keys state
  const [liveKey, setLiveKey] = useState("");
  const [testKey, setTestKey] = useState("");
  const [showLive, setShowLive] = useState(false);
  const [showTest, setShowTest] = useState(false);

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookLoading, setWebhookLoading] = useState(false);

  // Check existing progress
  useEffect(() => {
    if (!user) return;
    checkProgress();
  }, [user]);

  const checkProgress = async () => {
    if (!user) return;

    const { data: dev } = await supabase
      .from("developers")
      .select("id, live_api_key, test_api_key, webhook_url, webhook_secret")
      .eq("auth_id", user.id)
      .single();

    if (!dev) return;

    setLiveKey(dev.live_api_key ?? "");
    setTestKey(dev.test_api_key ?? "");
    setWebhookUrl(dev.webhook_url ?? "");
    setWebhookSecret(dev.webhook_secret ?? "");

    const { data: wallets } = await supabase
      .from("agent_wallets")
      .select("id, name")
      .eq("owner_id", dev.id)
      .limit(1);

    const hasWallet = (wallets?.length ?? 0) > 0;
    const hasKeys = !!dev.live_api_key;
    const hasWebhook = !!dev.webhook_url;

    if (hasWallet) setCreatedWallet(wallets?.[0]);

    const updated = [...steps];
    updated[0].completed = hasWallet;
    updated[1].completed = hasKeys;
    updated[2].completed = hasWebhook;
    setSteps(updated);

    // Jump to first incomplete step
    const firstIncomplete = updated.findIndex(s => !s.completed);
    if (firstIncomplete === -1) {
      onComplete();
    } else {
      setCurrentStep(firstIncomplete);
    }
  };

  const markStepComplete = (index: number) => {
    const updated = [...steps];
    updated[index].completed = true;
    setSteps(updated);

    if (index < steps.length - 1) {
      setCurrentStep(index + 1);
    } else {
      // All done
      const allDone = updated.every(s => s.completed);
      if (allDone) {
        toast.success("Onboarding complete! You're ready to go.");
        setTimeout(onComplete, 1000);
      }
    }
  };

  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      toast.error("Please enter a wallet name");
      return;
    }
    if (!user) return;

    setWalletLoading(true);
    try {
      const { data: dev } = await supabase
        .from("developers")
        .select("test_api_key")
        .eq("auth_id", user.id)
        .single();

      if (!dev?.test_api_key) {
        toast.error("No API key found");
        return;
      }

      const { data, error } = await supabase.functions.invoke("agents-create", {
        headers: { "x-api-key": dev.test_api_key },
        body: {
          name: walletName,
          country: walletCountry,
          currency: walletCountry === "NG" ? "NGN" : walletCountry === "GH" ? "GHS" : "USD",
        },
      });

      if (error) throw error;
      setCreatedWallet(data);
      toast.success("Wallet created!");
      analytics.track(EVENTS.WALLET_CREATED, { source: "onboarding", country: walletCountry });
      markStepComplete(0);
    } catch (err: any) {
      toast.error(err.message || "Failed to create wallet");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleCopyKey = (key: string, label: string) => {
    navigator.clipboard.writeText(key);
    toast.success(`${label} copied!`);
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    if (!user) return;

    setWebhookLoading(true);
    try {
      const secret = webhookSecret || `whsec_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;

      const { error } = await supabase
        .from("developers")
        .update({ webhook_url: webhookUrl, webhook_secret: secret })
        .eq("auth_id", user.id);

      if (error) throw error;
      setWebhookSecret(secret);
      toast.success("Webhook configured!");
      analytics.track(EVENTS.WEBHOOK_CONFIGURED, { source: "onboarding" });
      markStepComplete(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to save webhook");
    } finally {
      setWebhookLoading(false);
    }
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
          <Sparkles size={14} /> Getting Started
        </div>
        <h1 className="text-2xl font-bold">Welcome to Paysmith</h1>
        <p className="text-muted-foreground text-sm">Complete these steps to start processing payments with your AI agents.</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completedCount} of {steps.length} completed</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`rounded-xl border transition-all ${
              currentStep === index
                ? "border-primary bg-card shadow-sm"
                : step.completed
                ? "border-border bg-card/50 opacity-75"
                : "border-border bg-card/30"
            }`}
          >
            {/* Step header */}
            <button
              onClick={() => setCurrentStep(index)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                step.completed
                  ? "bg-emerald-500/20 text-emerald-400"
                  : currentStep === index
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {step.completed ? <Check size={16} /> : step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {!step.completed && currentStep !== index && (
                <ChevronRight size={16} className="text-muted-foreground" />
              )}
            </button>

            {/* Step content */}
            {currentStep === index && !step.completed && (
              <div className="px-4 pb-4 pt-0">
                <div className="border-t border-border pt-4">
                  {index === 0 && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Wallet Name</label>
                        <input
                          value={walletName}
                          onChange={e => setWalletName(e.target.value)}
                          placeholder="e.g. My AI Agent"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
                        <select
                          value={walletCountry}
                          onChange={e => setWalletCountry(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="NG">Nigeria (NGN)</option>
                          <option value="GH">Ghana (GHS)</option>
                          <option value="US">United States (USD)</option>
                        </select>
                      </div>
                      <button
                        onClick={handleCreateWallet}
                        disabled={walletLoading}
                        className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {walletLoading ? <RefreshCw size={14} className="animate-spin" /> : <Wallet size={14} />}
                        Create Wallet
                      </button>
                    </div>
                  )}

                  {index === 1 && (
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground">Your API keys were auto-generated. Copy them to integrate Paysmith.</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border border-input bg-secondary/30 px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">Live Key</p>
                            <code className="text-xs">{showLive ? liveKey : "••••••••••••••••"}</code>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => setShowLive(!showLive)} className="p-1.5 rounded hover:bg-secondary">
                              {showLive ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                            </button>
                            <button onClick={() => handleCopyKey(liveKey, "Live key")} className="p-1.5 rounded hover:bg-secondary">
                              <Copy size={14} className="text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-input bg-secondary/30 px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">Test Key</p>
                            <code className="text-xs">{showTest ? testKey : "••••••••••••••••"}</code>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => setShowTest(!showTest)} className="p-1.5 rounded hover:bg-secondary">
                              {showTest ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                            </button>
                            <button onClick={() => handleCopyKey(testKey, "Test key")} className="p-1.5 rounded hover:bg-secondary">
                              <Copy size={14} className="text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Interactive code snippets - Test Payment */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Code size={14} className="text-primary" />
                          <p className="text-xs font-medium">Make a test payment</p>
                        </div>
                        <SnippetTabs testKey={testKey} walletId={createdWallet?.walletId || createdWallet?.id} showTryLive />
                      </div>

                      {/* Wallet creation snippets */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Plus size={14} className="text-primary" />
                          <p className="text-xs font-medium">Create wallets via API</p>
                        </div>
                        <WalletCreationSnippets testKey={testKey} />
                      </div>

                      <button
                        onClick={() => { analytics.track(EVENTS.API_KEY_CREATED, { source: "onboarding" }); markStepComplete(1); }}
                        className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={14} /> I've Copied My Keys
                      </button>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Webhook URL</label>
                        <input
                          value={webhookUrl}
                          onChange={e => setWebhookUrl(e.target.value)}
                          placeholder="https://your-api.com/webhooks/paysmith"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveWebhook}
                          disabled={webhookLoading}
                          className="flex-1 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {webhookLoading ? <RefreshCw size={14} className="animate-spin" /> : <Webhook size={14} />}
                          Save & Finish
                        </button>
                        <button
                          onClick={() => {
                            markStepComplete(2);
                          }}
                          className="rounded-lg border border-input px-4 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingWizard;
