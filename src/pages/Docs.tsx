import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Book, Code, Zap, Shield, Terminal, ChevronRight, Copy, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const sidebarSections = [
  { id: "quickstart", label: "Quick Start", icon: Zap },
  { id: "installation", label: "Installation", icon: Terminal },
  { id: "authentication", label: "Authentication", icon: Shield },
  { id: "create-wallet", label: "Create a Wallet", icon: Code },
  { id: "send-payment", label: "Send a Payment", icon: Code },
  { id: "receive-payment", label: "Receive a Payment", icon: Code },
  { id: "check-balance", label: "Check Balance", icon: Code },
  { id: "multi-rail", label: "Multi-Rail Routing", icon: Book },
  { id: "policies", label: "Policy Enforcement", icon: Shield },
  { id: "webhooks", label: "Webhooks", icon: Code },
  { id: "errors", label: "Error Handling", icon: Shield },
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
          <h2 className="text-lg font-semibold mb-4">Documentation</h2>
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
            <h1 className="text-4xl font-semibold tracking-tight mb-4">Quick Start</h1>
            <p className="text-muted-foreground mb-6">
              Get your first agent wallet running in under 5 minutes. This guide walks you through installation,
              authentication, and making your first payment.
            </p>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-medium mb-2 flex items-center gap-2"><Zap size={16} /> Prerequisites</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Node.js 18+ or Bun runtime</li>
                <li>A Paysmith account (sign up at dashboard)</li>
                <li>An API key from the dashboard</li>
              </ul>
            </div>
          </section>

          {/* Installation */}
          <section id="installation" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Installation</h2>
            <p className="text-muted-foreground mb-4">Install the Paysmith SDK using your preferred package manager:</p>
            <CodeBlock code="npm install @paysmith/sdk" language="bash" />
            <p className="text-sm text-muted-foreground">Or with yarn / pnpm:</p>
            <CodeBlock code={`yarn add @paysmith/sdk\n# or\npnpm add @paysmith/sdk`} language="bash" />
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Authentication</h2>
            <p className="text-muted-foreground mb-4">
              Initialize the Paysmith client with your API key. Never expose your secret key in client-side code.
            </p>
            <CodeBlock
              code={`import { Paysmith } from "@paysmith/sdk";

const client = new Paysmith({
  apiKey: process.env.PAYSMITH_API_KEY,
  environment: "sandbox", // or "production"
});`}
            />
            <div className="rounded-xl border border-border bg-card p-4 mt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Security tip:</strong> Store your API key in environment variables.
                Use the sandbox environment for development and testing.
              </p>
            </div>
          </section>

          {/* Create Wallet */}
          <section id="create-wallet" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Create a Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Create an agent wallet that can autonomously send and receive payments across multiple rails.
            </p>
            <CodeBlock
              code={`const wallet = await client.createAgentWallet({
  name: "My AI Agent",
  currency: "USD",
  rails: ["mtn_momo", "bank_transfer", "card"],
  policy: {
    maxTransactionAmount: 1000,
    dailyLimit: 5000,
    requireApproval: false,
  },
});

console.log("Wallet ID:", wallet.id);
console.log("Address:", wallet.address);`}
            />
            <h3 className="text-lg font-medium mt-6 mb-3">Parameters</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Parameter</th>
                    <th className="text-left px-4 py-2 font-medium">Type</th>
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="px-4 py-2 font-mono text-xs">name</td><td className="px-4 py-2">string</td><td className="px-4 py-2 text-muted-foreground">Display name for the wallet</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">currency</td><td className="px-4 py-2">string</td><td className="px-4 py-2 text-muted-foreground">ISO 4217 currency code</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">rails</td><td className="px-4 py-2">string[]</td><td className="px-4 py-2 text-muted-foreground">Payment rails to enable</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">policy</td><td className="px-4 py-2">object</td><td className="px-4 py-2 text-muted-foreground">Transaction policy rules</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Send Payment */}
          <section id="send-payment" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Send a Payment</h2>
            <p className="text-muted-foreground mb-4">
              Initiate a payment from an agent wallet. The SDK automatically selects the optimal rail.
            </p>
            <CodeBlock
              code={`const payment = await wallet.pay({
  to: "+233201234567",        // recipient phone or address
  amount: 50.00,
  currency: "GHS",
  reference: "invoice-001",
  metadata: {
    orderId: "abc123",
    agent: "procurement-bot",
  },
});

console.log("Payment status:", payment.status);
console.log("Transaction ID:", payment.transactionId);`}
            />
          </section>

          {/* Receive Payment */}
          <section id="receive-payment" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Receive a Payment</h2>
            <p className="text-muted-foreground mb-4">
              Generate a payment request or listen for incoming payments to your agent wallet.
            </p>
            <CodeBlock
              code={`// Generate a payment link
const request = await wallet.receive({
  amount: 100.00,
  currency: "GHS",
  description: "Service payment",
  expiresIn: "24h",
});

console.log("Payment URL:", request.paymentUrl);
console.log("QR Code:", request.qrCode);

// Listen for incoming payments
wallet.on("payment.received", (event) => {
  console.log("Received:", event.amount, event.currency);
  console.log("From:", event.sender);
});`}
            />
          </section>

          {/* Check Balance */}
          <section id="check-balance" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Check Balance</h2>
            <CodeBlock
              code={`const balance = await wallet.balance();

console.log("Available:", balance.available);
console.log("Pending:", balance.pending);
console.log("Currency:", balance.currency);`}
            />
          </section>

          {/* Multi-Rail Routing */}
          <section id="multi-rail" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Multi-Rail Routing</h2>
            <p className="text-muted-foreground mb-4">
              Paysmith automatically routes payments through the optimal rail based on cost, speed, and availability.
              You can also specify a preferred rail or define routing priorities.
            </p>
            <CodeBlock
              code={`const payment = await wallet.pay({
  to: "+233201234567",
  amount: 200.00,
  currency: "GHS",
  routing: {
    preferred: "mtn_momo",
    fallback: ["bank_transfer", "card"],
    strategy: "lowest_cost", // or "fastest", "most_reliable"
  },
});`}
            />
            <h3 className="text-lg font-medium mt-6 mb-3">Routing Strategies</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-1 shrink-0" /><span><strong className="text-foreground">lowest_cost</strong> — Minimizes transaction fees</span></li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-1 shrink-0" /><span><strong className="text-foreground">fastest</strong> — Prioritizes settlement speed</span></li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-1 shrink-0" /><span><strong className="text-foreground">most_reliable</strong> — Routes through the highest uptime rail</span></li>
            </ul>
          </section>

          {/* Policy Enforcement */}
          <section id="policies" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Policy Enforcement</h2>
            <p className="text-muted-foreground mb-4">
              Define spending limits, approval workflows, and compliance rules at the wallet level.
            </p>
            <CodeBlock
              code={`await wallet.updatePolicy({
  maxTransactionAmount: 500,
  dailyLimit: 2000,
  monthlyLimit: 50000,
  requireApproval: true,
  approvalThreshold: 200,    // require approval above this amount
  allowedRecipients: ["+233*"], // wildcard patterns
  blockedCountries: ["XX"],
  auditLog: true,
});`}
            />
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Webhooks</h2>
            <p className="text-muted-foreground mb-4">
              Subscribe to real-time events for payment status updates, balance changes, and policy violations.
            </p>
            <CodeBlock
              code={`// Configure webhooks in the dashboard or via API
await client.webhooks.create({
  url: "https://your-server.com/webhooks/paysmith",
  events: [
    "payment.completed",
    "payment.failed",
    "balance.updated",
    "policy.violation",
  ],
  secret: "whsec_your_signing_secret",
});`}
              language="typescript"
            />
            <h3 className="text-lg font-medium mt-6 mb-3">Event Types</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Event</th>
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="px-4 py-2 font-mono text-xs">payment.completed</td><td className="px-4 py-2 text-muted-foreground">Payment successfully settled</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">payment.failed</td><td className="px-4 py-2 text-muted-foreground">Payment failed or was rejected</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">balance.updated</td><td className="px-4 py-2 text-muted-foreground">Wallet balance changed</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">policy.violation</td><td className="px-4 py-2 text-muted-foreground">Transaction violated a policy rule</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Error Handling */}
          <section id="errors" className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Error Handling</h2>
            <p className="text-muted-foreground mb-4">
              The SDK throws typed errors for common failure cases. Always wrap API calls in try-catch blocks.
            </p>
            <CodeBlock
              code={`import { PaysmithError, InsufficientFundsError, PolicyViolationError } from "@paysmith/sdk";

try {
  await wallet.pay({ to: "+233201234567", amount: 10000, currency: "GHS" });
} catch (error) {
  if (error instanceof InsufficientFundsError) {
    console.log("Not enough funds:", error.available);
  } else if (error instanceof PolicyViolationError) {
    console.log("Policy violated:", error.rule);
  } else if (error instanceof PaysmithError) {
    console.log("API error:", error.code, error.message);
  }
}`}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Docs;
