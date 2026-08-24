import { Copy, Check, Terminal, Zap, Shield, ArrowRightLeft } from "lucide-react";
import { useState } from "react";

const CODE_SNIPPET = `const BASE = 'https://hkngxtrqhnkzkbqgqbjk.supabase.co/functions/v1';
const KEY = process.env.PAYSMITH_TEST_KEY; // x-api-key

// 1) Create an agent wallet
const { walletId } = await fetch(\`\${BASE}/agents-create\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': KEY },
  body: JSON.stringify({
    name: 'procurement-bot',
    country: 'GH',
    currency: 'GHS',
  }),
}).then(r => r.json());

// 2) Pay MoMo (or bank_transfer / crypto USDC|XLM)
const tx = await fetch(\`\${BASE}/pay\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': KEY,
    'Idempotency-Key': 'order_42',
  },
  body: JSON.stringify({
    walletId,
    to: '0551234987',
    amount: 1,
    currency: 'GHS',
    method: 'mobile_money',
    bankCode: 'MTN',
  }),
}).then(r => r.json());

// 3) Check balance
const bal = await fetch(\`\${BASE}/agents-balance?walletId=\${walletId}\`, {
  headers: { 'x-api-key': KEY },
}).then(r => r.json());`;

const FEATURES = [
  {
    icon: Terminal,
    title: "3 API calls",
    description: "Create wallet → pay → balance. Real Edge endpoints — no fictional SDK.",
  },
  {
    icon: ArrowRightLeft,
    title: "Multi-rail",
    description: "Paystack MoMo, Flutterwave bank failover, Stellar XLM/USDC on testnet.",
  },
  {
    icon: Shield,
    title: "Policy + KYC ceilings",
    description: "Daily / per-tx caps clamped by KYC tier; Idempotency-Key stops double-spend.",
  },
  {
    icon: Zap,
    title: "Sandbox-first",
    description: "Test keys + Stellar testnet rails — production-shaped API before live KYB.",
  },
];

const CodeIntegrationSection = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code" className="relative z-10 px-4 sm:px-6 md:px-12 py-16 md:py-24">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3">
          Developer Experience
        </p>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] mb-4">
          One API. Three calls. Done.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mb-12 md:mb-16">
          Create an agent wallet, pay MoMo or Stellar USDC, then read the balance — against the live sandbox API.
        </p>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Code Block */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl liquid-glass overflow-hidden">
              {/* Code Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-foreground/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                  <span className="ml-3 text-xs text-muted-foreground font-mono">
                    agent-wallet.ts
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Code Content */}
              <div className="p-4 sm:p-6 overflow-x-auto">
                <pre className="text-xs sm:text-sm font-mono leading-relaxed">
                  <code>
                    {CODE_SNIPPET.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="inline-block w-8 text-right mr-4 text-muted-foreground/40 select-none flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-foreground/90">
                          {highlightLine(line)}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="lg:w-[380px] flex flex-col gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl liquid-glass p-5 sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center flex-shrink-0">
                    <feature.icon size={18} className="text-foreground/80" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function highlightLine(line: string) {
  // Simple syntax highlighting
  return line
    .split(/(\/\/.*$|'[^']*'|`[^`]*`|import|from|const|await|new)/)
    .map((part, i) => {
      if (/^\/\//.test(part))
        return <span key={i} className="text-muted-foreground/60">{part}</span>;
      if (/^['`]/.test(part))
        return <span key={i} className="text-emerald-400/80">{part}</span>;
      if (/^(import|from|const|await|new)$/.test(part))
        return <span key={i} className="text-sky-400/80">{part}</span>;
      return <span key={i}>{part}</span>;
    });
}

export default CodeIntegrationSection;
