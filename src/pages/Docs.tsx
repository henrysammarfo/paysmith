import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Book, Code, Zap, Shield, Terminal, ChevronRight, Copy, Check, Server, Gauge } from "lucide-react";
import Footer from "@/components/Footer";
import { useState, useEffect, useRef } from "react";

const sidebarSections = [
  { id: "quickstart", label: "Quick Start", icon: Zap },
  { id: "authentication", label: "Authentication", icon: Shield },
  { id: "api-agents-create", label: "POST /agents-create", icon: Server },
  { id: "api-agents-balance", label: "GET /agents-balance", icon: Server },
  { id: "api-pay", label: "POST /pay", icon: Server },
  { id: "multi-rail", label: "Multi-Rail Routing", icon: Book },
  { id: "policies", label: "Policy Enforcement", icon: Shield },
  { id: "webhooks", label: "Webhooks", icon: Code },
  { id: "rate-limits", label: "Rate Limits", icon: Gauge },
  { id: "errors", label: "Error Codes", icon: Shield },
];

function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl bg-secondary/50 border border-border overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border text-xs text-muted-foreground">
        <span>{language}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 hover:text-foreground transition-colors">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto"><code>{code}</code></pre>
    </div>
  );
}

function ParamTable({ params }: { params: { name: string; type: string; required: boolean; desc: string }[] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Parameter</th>
            <th className="text-left px-4 py-2 font-medium">Type</th>
            <th className="text-left px-4 py-2 font-medium">Required</th>
            <th className="text-left px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {params.map((p) => (
            <tr key={p.name}>
              <td className="px-4 py-2 font-mono text-xs">{p.name}</td>
              <td className="px-4 py-2 text-muted-foreground">{p.type}</td>
              <td className="px-4 py-2">{p.required ? <span className="text-primary text-xs font-medium">Yes</span> : <span className="text-muted-foreground text-xs">No</span>}</td>
              <td className="px-4 py-2 text-muted-foreground">{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BASE_URL = "https://your-project.supabase.co/functions/v1";

const Docs = () => {
  const [activeSection, setActiveSection] = useState("quickstart");
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash && sidebarSections.some((s) => s.id === hash)) {
      setActiveSection(hash);
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border sticky top-0 h-screen overflow-y-auto py-8 px-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
          <h2 className="text-lg font-semibold mb-4">API Reference</h2>
          <nav className="space-y-1">
            {sidebarSections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === s.id
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <s.icon size={14} />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main ref={contentRef} className="flex-1 px-4 sm:px-8 lg:px-16 py-8 sm:py-12 max-w-4xl">
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>

          {/* Quick Start */}
          <section id="quickstart" className="mb-16">
            <h1 className="text-4xl font-semibold tracking-tight mb-4">API Reference</h1>
            <p className="text-muted-foreground mb-6">
              Complete reference for the Paysmith REST API. All endpoints accept JSON and require an <code className="text-foreground bg-secondary/50 px-1.5 py-0.5 rounded text-xs">X-API-KEY</code> header.
            </p>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-medium flex items-center gap-2"><Zap size={16} /> Base URL</h3>
              <CodeBlock code={BASE_URL} language="plaintext" />
              <h3 className="font-medium flex items-center gap-2"><Shield size={16} /> Prerequisites</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>A Paysmith account — <Link to="/signup" className="text-primary hover:underline">sign up here</Link></li>
                <li>A Live or Test API key from the dashboard</li>
              </ul>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Authentication</h2>
            <p className="text-muted-foreground mb-4">
              Every request must include your API key in the <code className="text-foreground bg-secondary/50 px-1.5 py-0.5 rounded text-xs">X-API-KEY</code> header.
              Test keys (prefixed <code className="text-foreground bg-secondary/50 px-1.5 py-0.5 rounded text-xs">ps_test_</code>) hit the sandbox; live keys (prefixed <code className="text-foreground bg-secondary/50 px-1.5 py-0.5 rounded text-xs">ps_live_</code>) hit production rails.
            </p>
            <CodeBlock
              code={`curl -H "X-API-KEY: ps_test_abc123..." \\
     ${BASE_URL}/agents-balance`}
              language="bash"
            />
            <div className="rounded-xl border border-border bg-card p-4 mt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Security:</strong> Never expose your API key in client-side code.
                Store it in environment variables or a secrets manager.
              </p>
            </div>
          </section>

          {/* ─── POST /agents-create ─── */}
          <section id="api-agents-create" className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary">POST</span>
              <h2 className="text-2xl font-semibold tracking-tight">/agents-create</h2>
            </div>
            <p className="text-muted-foreground mb-4">Create a new agent wallet with spending policies and payment methods.</p>

            <h3 className="text-lg font-medium mt-6 mb-2">Request Body</h3>
            <ParamTable params={[
              { name: "name", type: "string", required: true, desc: "Display name for the wallet" },
              { name: "country", type: "string", required: true, desc: "ISO 3166-1 alpha-2 country code (e.g. NG, GH, US)" },
              { name: "currency", type: "string", required: true, desc: "ISO 4217 currency code (NGN, GHS, USD)" },
              { name: "paymentMethods", type: "string[]", required: false, desc: 'Enabled rails, e.g. ["mobile_money", "bank_transfer"]' },
              { name: "spendingPolicy", type: "object", required: false, desc: "Custom spending limits (see below)" },
            ]} />

            <h4 className="text-sm font-medium mt-4 mb-2">spendingPolicy object</h4>
            <ParamTable params={[
              { name: "dailyLimit", type: "number", required: false, desc: "Max spend per day. Default 10,000" },
              { name: "maxSingleTx", type: "number", required: false, desc: "Max per-transaction amount. Default 2,000" },
              { name: "requireApprovalAbove", type: "number", required: false, desc: "Require approval above this amount. Default 5,000" },
            ]} />

            <h3 className="text-lg font-medium mt-6 mb-2">Example Request</h3>
            <CodeBlock code={`curl -X POST ${BASE_URL}/agents-create \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ps_test_abc123..." \\
  -d '{
    "name": "Procurement Bot",
    "country": "NG",
    "currency": "NGN",
    "paymentMethods": ["mobile_money", "bank_transfer"],
    "spendingPolicy": {
      "dailyLimit": 50000,
      "maxSingleTx": 10000,
      "requireApprovalAbove": 25000
    }
  }'`} language="bash" />

            <h3 className="text-lg font-medium mt-6 mb-2">Example Response <span className="text-xs font-normal text-muted-foreground">201 Created</span></h3>
            <CodeBlock code={`{
  "walletId": "ps_agent_a1b2c3d4e5f6g7h8",
  "apiKey": "ps_wk_9f8e7d6c5b4a3...",
  "status": "active",
  "name": "Procurement Bot",
  "country": "NG",
  "currency": "NGN",
  "paymentMethods": ["mobile_money", "bank_transfer"],
  "spendingPolicy": {
    "dailyLimit": 50000,
    "maxSingleTx": 10000,
    "requireApprovalAbove": 25000
  }
}`} language="json" />
          </section>

          {/* ─── GET /agents-balance ─── */}
          <section id="api-agents-balance" className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">GET</span>
              <h2 className="text-2xl font-semibold tracking-tight">/agents-balance</h2>
            </div>
            <p className="text-muted-foreground mb-4">Retrieve balances and details for one or all wallets.</p>

            <h3 className="text-lg font-medium mt-6 mb-2">Query Parameters</h3>
            <ParamTable params={[
              { name: "walletId", type: "string", required: false, desc: "Return a single wallet. If omitted, returns all wallets." },
            ]} />

            <h3 className="text-lg font-medium mt-6 mb-2">Example — Single Wallet</h3>
            <CodeBlock code={`curl "${BASE_URL}/agents-balance?walletId=ps_agent_a1b2c3d4e5f6g7h8" \\
  -H "X-API-KEY: ps_test_abc123..."`} language="bash" />

            <h3 className="text-lg font-medium mt-6 mb-2">Response <span className="text-xs font-normal text-muted-foreground">200 OK</span></h3>
            <CodeBlock code={`{
  "walletId": "ps_agent_a1b2c3d4e5f6g7h8",
  "name": "Procurement Bot",
  "country": "NG",
  "currency": "NGN",
  "status": "active",
  "balances": {
    "ghs": 0,
    "ngn": 45200.50,
    "usdc": 0
  },
  "paymentMethods": ["mobile_money", "bank_transfer"],
  "spendingPolicy": { "dailyLimit": 50000, "maxSingleTx": 10000, "requireApprovalAbove": 25000 },
  "totalVolume": 125000,
  "totalTransactions": 42,
  "createdAt": "2026-04-10T08:30:00Z"
}`} language="json" />

            <h3 className="text-lg font-medium mt-6 mb-2">Example — All Wallets</h3>
            <CodeBlock code={`curl "${BASE_URL}/agents-balance" \\
  -H "X-API-KEY: ps_test_abc123..."`} language="bash" />
            <CodeBlock code={`{
  "wallets": [
    { "walletId": "ps_agent_...", "name": "Bot A", "currency": "NGN", "status": "active", ... },
    { "walletId": "ps_agent_...", "name": "Bot B", "currency": "GHS", "status": "active", ... }
  ],
  "count": 2
}`} language="json" />
          </section>

          {/* ─── POST /pay ─── */}
          <section id="api-pay" className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary">POST</span>
              <h2 className="text-2xl font-semibold tracking-tight">/pay</h2>
            </div>
            <p className="text-muted-foreground mb-4">Send a payment from an agent wallet. Automatically routed through the optimal rail.</p>

            <h3 className="text-lg font-medium mt-6 mb-2">Request Body</h3>
            <ParamTable params={[
              { name: "walletId", type: "string", required: true, desc: "Agent wallet ID (ps_agent_...)" },
              { name: "to", type: "string", required: true, desc: "Recipient phone number, address, or account" },
              { name: "amount", type: "number", required: true, desc: "Amount to send (positive number)" },
              { name: "currency", type: "string", required: true, desc: "ISO 4217 currency code" },
              { name: "method", type: "string", required: true, desc: '"mobile_money", "bank_transfer", "crypto", or "card"' },
              { name: "note", type: "string", required: false, desc: "Optional payment note / reference" },
            ]} />

            <h3 className="text-lg font-medium mt-6 mb-2">Example Request</h3>
            <CodeBlock code={`curl -X POST ${BASE_URL}/pay \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ps_test_abc123..." \\
  -d '{
    "walletId": "ps_agent_a1b2c3d4e5f6g7h8",
    "to": "+2348012345678",
    "amount": 5000,
    "currency": "NGN",
    "method": "mobile_money",
    "note": "Invoice #1042"
  }'`} language="bash" />

            <h3 className="text-lg font-medium mt-6 mb-2">Example Response <span className="text-xs font-normal text-muted-foreground">200 OK</span></h3>
            <CodeBlock code={`{
  "txId": "ps_tx_f4a8e2c19b0d7e63",
  "status": "settled",
  "provider": "sandbox",
  "settledAt": "2026-04-14T12:30:00Z",
  "fee": "25.00 NGN",
  "amount": 5000,
  "currency": "NGN",
  "method": "mobile_money",
  "recipient": "+2348012345678"
}`} language="json" />

            <h3 className="text-lg font-medium mt-6 mb-2">Policy Enforcement</h3>
            <p className="text-sm text-muted-foreground mb-2">The API validates every payment against the wallet's spending policy before routing:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><code className="text-foreground bg-secondary/50 px-1 rounded text-xs">400</code> — Exceeds <code className="text-xs bg-secondary/50 px-1 rounded">maxSingleTx</code> or <code className="text-xs bg-secondary/50 px-1 rounded">dailyLimit</code></li>
              <li><code className="text-foreground bg-secondary/50 px-1 rounded text-xs">402</code> — Requires manual approval (amount &gt; <code className="text-xs bg-secondary/50 px-1 rounded">requireApprovalAbove</code>)</li>
              <li><code className="text-foreground bg-secondary/50 px-1 rounded text-xs">403</code> — Wallet is not active</li>
            </ul>
          </section>

          {/* Multi-Rail Routing */}
          <section id="multi-rail" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Multi-Rail Routing</h2>
            <p className="text-muted-foreground mb-4">
              The <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">/pay</code> endpoint automatically routes through the best available rail:
            </p>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Provider</th>
                    <th className="text-left px-4 py-2 font-medium">Methods</th>
                    <th className="text-left px-4 py-2 font-medium">Fee</th>
                    <th className="text-left px-4 py-2 font-medium">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="px-4 py-2 font-medium">Chimoney</td><td className="px-4 py-2 text-muted-foreground">mobile_money, crypto</td><td className="px-4 py-2 text-muted-foreground">1%</td><td className="px-4 py-2 text-muted-foreground">Pending → settled</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Flutterwave</td><td className="px-4 py-2 text-muted-foreground">bank_transfer</td><td className="px-4 py-2 text-muted-foreground">1.5%</td><td className="px-4 py-2 text-muted-foreground">Instant or pending</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Sandbox</td><td className="px-4 py-2 text-muted-foreground">All (fallback)</td><td className="px-4 py-2 text-muted-foreground">0.5%</td><td className="px-4 py-2 text-muted-foreground">Instant (simulated)</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              When no provider API keys are configured, all payments route through the sandbox stub which simulates instant settlement.
            </p>
          </section>

          {/* Policy Enforcement */}
          <section id="policies" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Policy Enforcement</h2>
            <p className="text-muted-foreground mb-4">
              Every wallet has a <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">spendingPolicy</code> object enforced on each payment:
            </p>
            <CodeBlock code={`{
  "dailyLimit": 10000,       // Max total spend per UTC day
  "maxSingleTx": 2000,      // Max per-transaction amount
  "requireApprovalAbove": 5000  // Flag for manual approval
}`} language="json" />
            <p className="text-sm text-muted-foreground mt-2">
              Update policies via the dashboard Wallet settings or by recreating the wallet with new limits.
            </p>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Webhooks</h2>
            <p className="text-muted-foreground mb-4">
              Configure a webhook URL in the dashboard to receive real-time notifications. Payloads are signed with your <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">webhook_secret</code> using HMAC-SHA256.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-2">Event Types</h3>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Event</th>
                    <th className="text-left px-4 py-2 font-medium">Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="px-4 py-2 font-mono text-xs">transaction.settled</td><td className="px-4 py-2 text-muted-foreground">Payment successfully settled</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">transaction.failed</td><td className="px-4 py-2 text-muted-foreground">Payment failed</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium mt-6 mb-2">Example Payload</h3>
            <CodeBlock code={`{
  "event": "transaction.settled",
  "timestamp": "2026-04-14T12:30:00Z",
  "data": {
    "txId": "ps_tx_f4a8e2c19b0d7e63",
    "walletId": "ps_agent_a1b2c3d4e5f6g7h8",
    "amount": 5000,
    "currency": "NGN",
    "method": "mobile_money",
    "recipient": "+2348012345678",
    "status": "settled",
    "fee": 25,
    "provider": "sandbox"
  }
}`} language="json" />

            <h3 className="text-lg font-medium mt-6 mb-2">Verifying Signatures</h3>
            <CodeBlock code={`import crypto from "crypto";

function verifyWebhook(body: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`} language="typescript" />
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Rate Limits</h2>
            <p className="text-muted-foreground mb-4">
              All endpoints enforce per-API-key rate limits to prevent abuse. Limits reset on a sliding window.
            </p>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Endpoint</th>
                    <th className="text-left px-4 py-2 font-medium">Limit</th>
                    <th className="text-left px-4 py-2 font-medium">Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="px-4 py-2 font-mono text-xs">/pay</td><td className="px-4 py-2 text-muted-foreground">30 requests</td><td className="px-4 py-2 text-muted-foreground">60 seconds</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">/agents-create</td><td className="px-4 py-2 text-muted-foreground">10 requests</td><td className="px-4 py-2 text-muted-foreground">60 seconds</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">/agents-balance</td><td className="px-4 py-2 text-muted-foreground">60 requests</td><td className="px-4 py-2 text-muted-foreground">60 seconds</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mb-2">When rate-limited, you'll receive:</p>
            <CodeBlock code={`{
  "error": "Rate limit exceeded. Try again in 45 seconds.",
  "retryAfter": 45
}`} language="json" />
            <p className="text-sm text-muted-foreground">
              The response includes a <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">Retry-After</code> header and a <code className="text-foreground bg-secondary/50 px-1 rounded text-xs">429</code> status code.
            </p>
          </section>

          {/* Error Codes */}
          <section id="errors" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Error Codes</h2>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-left px-4 py-2 font-medium">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="px-4 py-2 font-mono">400</td><td className="px-4 py-2 text-muted-foreground">Bad request — missing fields or policy violation</td></tr>
                  <tr><td className="px-4 py-2 font-mono">401</td><td className="px-4 py-2 text-muted-foreground">Invalid or missing API key</td></tr>
                  <tr><td className="px-4 py-2 font-mono">402</td><td className="px-4 py-2 text-muted-foreground">Payment requires manual approval</td></tr>
                  <tr><td className="px-4 py-2 font-mono">403</td><td className="px-4 py-2 text-muted-foreground">Wallet is suspended or inactive</td></tr>
                  <tr><td className="px-4 py-2 font-mono">404</td><td className="px-4 py-2 text-muted-foreground">Wallet not found</td></tr>
                  <tr><td className="px-4 py-2 font-mono">405</td><td className="px-4 py-2 text-muted-foreground">HTTP method not allowed</td></tr>
                  <tr><td className="px-4 py-2 font-mono">429</td><td className="px-4 py-2 text-muted-foreground">Rate limit exceeded</td></tr>
                  <tr><td className="px-4 py-2 font-mono">500</td><td className="px-4 py-2 text-muted-foreground">Internal server error</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">All error responses follow the format:</p>
            <CodeBlock code={`{ "error": "Human-readable error message" }`} language="json" />
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Docs;
