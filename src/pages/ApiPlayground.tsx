import { Link } from "react-router-dom";
import { ArrowLeft, Play, Loader2, Copy, Check, History, RotateCcw, Trash2, Code, Clock } from "lucide-react";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

type EndpointKey = "agents-create" | "agents-balance" | "pay";
type SnippetLang = "curl" | "node" | "python";

interface EndpointConfig {
  method: string;
  label: string;
  description: string;
  defaultBody: string;
  queryParams?: { name: string; placeholder: string }[];
}

interface HistoryEntry {
  id: string;
  endpoint: EndpointKey;
  label: string;
  body: string;
  queryValues: Record<string, string>;
  status: number | null;
  response: string;
  timestamp: number;
  durationMs: number | null;
}

const HISTORY_KEY = "ps_playground_history";
const MAX_HISTORY = 20;

type Environment = "sandbox" | "production";

const ENV_CONFIG: Record<Environment, { label: string; baseUrl: string; keyPrefix: string; badge: string; badgeClass: string }> = {
  sandbox: {
    label: "Sandbox",
    baseUrl: "https://your-project.supabase.co/functions/v1",
    keyPrefix: "ps_test_",
    badge: "Test Mode",
    badgeClass: "bg-accent text-accent-foreground",
  },
  production: {
    label: "Production",
    baseUrl: "https://your-project.supabase.co/functions/v1",
    keyPrefix: "ps_live_",
    badge: "Live Mode",
    badgeClass: "bg-destructive/20 text-destructive",
  },
};

const endpoints: Record<EndpointKey, EndpointConfig> = {
  "agents-create": {
    method: "POST",
    label: "POST /agents-create",
    description: "Create a new agent wallet with spending policies.",
    defaultBody: JSON.stringify({
      name: "Test Bot",
      country: "NG",
      currency: "NGN",
      paymentMethods: ["mobile_money"],
      spendingPolicy: { dailyLimit: 10000, maxSingleTx: 2000 },
    }, null, 2),
  },
  "agents-balance": {
    method: "GET",
    label: "GET /agents-balance",
    description: "Retrieve balances for one or all wallets.",
    defaultBody: "",
    queryParams: [{ name: "walletId", placeholder: "ps_agent_... (optional)" }],
  },
  pay: {
    method: "POST",
    label: "POST /pay",
    description: "Send a payment from an agent wallet.",
    defaultBody: JSON.stringify({
      walletId: "ps_agent_...",
      to: "+2348012345678",
      amount: 500,
      currency: "NGN",
      method: "mobile_money",
      note: "Test payment",
    }, null, 2),
  },
};

function generateSnippet(
  lang: SnippetLang,
  endpoint: EndpointKey,
  config: EndpointConfig,
  apiKey: string,
  body: string,
  queryValues: Record<string, string>,
  env: Environment
): string {
  const BASE_URL = ENV_CONFIG[env].baseUrl;
  const maskedKey = apiKey ? apiKey.slice(0, 12) + "..." : `${ENV_CONFIG[env].keyPrefix}YOUR_KEY`;
  let url = `${BASE_URL}/${endpoint}`;
  const qp = config.queryParams
    ?.filter((p) => queryValues[p.name]?.trim())
    .reduce((acc, p) => ({ ...acc, [p.name]: queryValues[p.name].trim() }), {} as Record<string, string>);
  if (qp && Object.keys(qp).length > 0) {
    url += "?" + new URLSearchParams(qp).toString();
  }

  if (lang === "curl") {
    if (config.method === "GET") {
      return `curl "${url}" \\\n  -H "X-API-KEY: ${maskedKey}"`;
    }
    return `curl -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-KEY: ${maskedKey}" \\\n  -d '${body}'`;
  }

  if (lang === "node") {
    if (config.method === "GET") {
      return `const response = await fetch("${url}", {
  headers: { "X-API-KEY": "${maskedKey}" },
});
const data = await response.json();
console.log(data);`;
    }
    return `const response = await fetch("${url}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": "${maskedKey}",
  },
  body: JSON.stringify(${body}),
});
const data = await response.json();
console.log(data);`;
  }

  // python
  if (config.method === "GET") {
    return `import requests

response = requests.get(
    "${url}",
    headers={"X-API-KEY": "${maskedKey}"}
)
print(response.json())`;
  }
  return `import requests

response = requests.post(
    "${url}",
    headers={
        "Content-Type": "application/json",
        "X-API-KEY": "${maskedKey}",
    },
    json=${body.replace(/"/g, '"')}
)
print(response.json())`;
}

function ResponseBlock({ data, status, durationMs }: { data: string; status: number | null; durationMs: number | null }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const isError = status && status >= 400;
  return (
    <div className={`rounded-xl border overflow-hidden ${isError ? "border-destructive/50" : "border-border"}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50 text-xs">
        <div className="flex items-center gap-3">
          <span className={isError ? "text-destructive" : "text-muted-foreground"}>
            {status ? `HTTP ${status}` : "Response"}
          </span>
          {durationMs !== null && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock size={10} />
              {durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(2)}s`}
            </span>
          )}
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
        {data}
      </pre>
    </div>
  );
}

function SnippetPanel({
  endpoint,
  config,
  apiKey,
  body,
  queryValues,
  env,
}: {
  endpoint: EndpointKey;
  config: EndpointConfig;
  apiKey: string;
  body: string;
  queryValues: Record<string, string>;
  env: Environment;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (lang: SnippetLang) => {
    const snippet = generateSnippet(lang, endpoint, config, apiKey, body, queryValues, env);
    navigator.clipboard.writeText(snippet);
    setCopied(lang);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Code size={14} className="text-muted-foreground" />
        <span className="text-sm font-medium">Save as Snippet</span>
      </div>
      <Tabs defaultValue="curl">
        <div className="px-4 pt-3">
          <TabsList className="h-8">
            <TabsTrigger value="curl" className="text-xs px-3 h-7">cURL</TabsTrigger>
            <TabsTrigger value="node" className="text-xs px-3 h-7">Node.js</TabsTrigger>
            <TabsTrigger value="python" className="text-xs px-3 h-7">Python</TabsTrigger>
          </TabsList>
        </div>
        {(["curl", "node", "python"] as SnippetLang[]).map((lang) => (
          <TabsContent key={lang} value={lang} className="px-4 pb-4 mt-0">
            <div className="relative">
              <pre className="p-4 text-sm font-mono text-foreground bg-secondary/50 rounded-lg overflow-x-auto whitespace-pre-wrap mt-2">
                {generateSnippet(lang, endpoint, config, apiKey, body, queryValues, env)}
              </pre>
              <button
                onClick={() => handleCopy(lang)}
                className="absolute top-4 right-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors bg-background/80 px-2 py-1 rounded"
              >
                {copied === lang ? <Check size={12} /> : <Copy size={12} />}
                {copied === lang ? "Copied" : "Copy"}
              </button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

const ApiPlayground = () => {
  const [selected, setSelected] = useState<EndpointKey>("pay");
  const [env, setEnv] = useState<Environment>("sandbox");
  const [apiKey, setApiKey] = useState("");
  const [body, setBody] = useState(endpoints.pay.defaultBody);
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);

  const envConfig = ENV_CONFIG[env];

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const config = endpoints[selected];

  const handleEndpointChange = (val: string) => {
    const key = val as EndpointKey;
    setSelected(key);
    setBody(endpoints[key].defaultBody);
    setQueryValues({});
    setResponse(null);
    setStatus(null);
    setDurationMs(null);
  };

  const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    saveHistory(updated);
  };

  const replayEntry = (entry: HistoryEntry) => {
    setSelected(entry.endpoint);
    setBody(entry.body);
    setQueryValues(entry.queryValues);
    setResponse(null);
    setStatus(null);
    setDurationMs(null);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleSend = async () => {
    if (!apiKey.trim()) {
      setResponse(JSON.stringify({ error: "Please enter your API key" }, null, 2));
      setStatus(400);
      setDurationMs(null);
      return;
    }
    setLoading(true);
    setResponse(null);
    setStatus(null);
    setDurationMs(null);

    const startTime = performance.now();

    try {
      const headers: Record<string, string> = { "x-api-key": apiKey };
      const options: any = { headers };

      if (config.method === "POST") {
        try {
          options.body = JSON.parse(body);
        } catch {
          setResponse(JSON.stringify({ error: "Invalid JSON in request body" }, null, 2));
          setStatus(400);
          setLoading(false);
          return;
        }
      }

      let functionName = selected as string;
      const invokeOptions: any = { method: config.method as any, ...options };

      const queryParamEntries = config.queryParams
        ?.filter((p) => queryValues[p.name]?.trim())
        .reduce((acc, p) => ({ ...acc, [p.name]: queryValues[p.name].trim() }), {} as Record<string, string>);

      if (queryParamEntries && Object.keys(queryParamEntries).length > 0) {
        const search = new URLSearchParams(queryParamEntries).toString();
        functionName = `${selected}?${search}`;
      }

      const { data, error } = await supabase.functions.invoke(functionName, invokeOptions);

      const elapsed = Math.round(performance.now() - startTime);
      setDurationMs(elapsed);

      let resStatus: number;
      let resBody: string;

      if (error) {
        resStatus = error.message?.includes("429") ? 429 : 400;
        resBody = JSON.stringify({ error: error.message }, null, 2);
      } else {
        resStatus = 200;
        resBody = JSON.stringify(data, null, 2);
      }

      setStatus(resStatus);
      setResponse(resBody);

      addToHistory({
        endpoint: selected,
        label: config.label,
        body,
        queryValues,
        status: resStatus,
        response: resBody,
        durationMs: elapsed,
      });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setDurationMs(elapsed);
      const resBody = JSON.stringify({ error: err.message || "Request failed" }, null, 2);
      setStatus(500);
      setResponse(resBody);
      addToHistory({
        endpoint: selected,
        label: config.label,
        body,
        queryValues,
        status: 500,
        response: resBody,
        durationMs: elapsed,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · " + d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <Link to="/docs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Docs
        </Link>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-semibold tracking-tight">API Playground</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowSnippet((v) => !v); setShowHistory(false); }}
              className="gap-2"
            >
              <Code size={14} />
              Snippet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowHistory((v) => !v); setShowSnippet(false); }}
              className="gap-2"
            >
              <History size={14} />
              History{history.length > 0 && ` (${history.length})`}
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mb-8">
          Test Paysmith API endpoints with your test API key. All requests hit the sandbox.
        </p>

        {/* Snippet panel */}
        {showSnippet && (
          <div className="mb-8">
            <SnippetPanel
              endpoint={selected}
              config={config}
              apiKey={apiKey}
              body={body}
              queryValues={queryValues}
            />
          </div>
        )}

        {/* History panel */}
        {showHistory && (
          <div className="mb-8 rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <History size={14} /> Request History
              </h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                  <Trash2 size={12} /> Clear all
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No requests yet. Send a request to see it here.</p>
            ) : (
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          entry.status && entry.status < 400
                            ? "bg-primary/20 text-primary"
                            : "bg-destructive/20 text-destructive"
                        }`}>
                          {entry.status}
                        </span>
                        <span className="text-sm font-mono truncate">{entry.label}</span>
                        {entry.durationMs !== null && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={10} />
                            {entry.durationMs < 1000 ? `${entry.durationMs}ms` : `${(entry.durationMs / 1000).toFixed(2)}s`}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => replayEntry(entry)}
                      className="gap-1.5 shrink-0 ml-2"
                    >
                      <RotateCcw size={12} /> Replay
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Key */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">API Key</label>
          <Input
            type="password"
            placeholder="ps_test_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono max-w-md"
          />
          <p className="text-xs text-muted-foreground mt-1">Use your test key from the dashboard.</p>
        </div>

        {/* Endpoint selector */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Endpoint</label>
          <Select value={selected} onValueChange={handleEndpointChange}>
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(endpoints).map(([key, ep]) => (
                <SelectItem key={key} value={key}>
                  {ep.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
        </div>

        {/* Query params */}
        {config.queryParams && config.queryParams.length > 0 && (
          <div className="mb-6 space-y-3">
            <label className="text-sm font-medium block">Query Parameters</label>
            {config.queryParams.map((p) => (
              <div key={p.name} className="flex items-center gap-3 max-w-md">
                <span className="text-sm font-mono text-muted-foreground w-24 shrink-0">{p.name}</span>
                <Input
                  placeholder={p.placeholder}
                  value={queryValues[p.name] || ""}
                  onChange={(e) => setQueryValues((prev) => ({ ...prev, [p.name]: e.target.value }))}
                  className="font-mono"
                />
              </div>
            ))}
          </div>
        )}

        {/* Request body */}
        {config.method === "POST" && (
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Request Body (JSON)</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-mono text-sm min-h-[200px]"
              spellCheck={false}
            />
          </div>
        )}

        {/* Send button */}
        <Button onClick={handleSend} disabled={loading} className="mb-8">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
          {loading ? "Sending..." : "Send Request"}
        </Button>

        {/* Response */}
        {response && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-2">Response</h3>
            <ResponseBlock data={response} status={status} durationMs={durationMs} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ApiPlayground;
