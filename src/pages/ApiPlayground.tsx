import { Link } from "react-router-dom";
import { ArrowLeft, Play, Loader2, Copy, Check } from "lucide-react";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type EndpointKey = "agents-create" | "agents-balance" | "pay";

interface EndpointConfig {
  method: string;
  label: string;
  description: string;
  defaultBody: string;
  queryParams?: { name: string; placeholder: string }[];
}

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

function ResponseBlock({ data, status }: { data: string; status: number | null }) {
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
        <span className={isError ? "text-destructive" : "text-muted-foreground"}>
          {status ? `HTTP ${status}` : "Response"}
        </span>
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

const ApiPlayground = () => {
  const [selected, setSelected] = useState<EndpointKey>("pay");
  const [apiKey, setApiKey] = useState("");
  const [body, setBody] = useState(endpoints.pay.defaultBody);
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const config = endpoints[selected];

  const handleEndpointChange = (val: string) => {
    const key = val as EndpointKey;
    setSelected(key);
    setBody(endpoints[key].defaultBody);
    setQueryValues({});
    setResponse(null);
    setStatus(null);
  };

  const handleSend = async () => {
    if (!apiKey.trim()) {
      setResponse(JSON.stringify({ error: "Please enter your API key" }, null, 2));
      setStatus(400);
      return;
    }
    setLoading(true);
    setResponse(null);
    setStatus(null);

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

      // Build the function name and query params separately
      let functionName = selected as string;
      const invokeOptions: any = { method: config.method as any, ...options };

      if (qp && Object.keys(qp).length > 0) {
        const search = new URLSearchParams(qp).toString();
        functionName = `${selected}?${search}`;
      }

      const { data, error } = await supabase.functions.invoke(functionName, invokeOptions);

      if (error) {
        setStatus(error.message?.includes("429") ? 429 : 400);
        setResponse(JSON.stringify({ error: error.message }, null, 2));
      } else {
        setStatus(200);
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setStatus(500);
      setResponse(JSON.stringify({ error: err.message || "Request failed" }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <Link to="/docs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Docs
        </Link>

        <h1 className="text-4xl font-semibold tracking-tight mb-2">API Playground</h1>
        <p className="text-muted-foreground mb-8">
          Test Paysmith API endpoints with your test API key. All requests hit the sandbox.
        </p>

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
            <ResponseBlock data={response} status={status} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ApiPlayground;
