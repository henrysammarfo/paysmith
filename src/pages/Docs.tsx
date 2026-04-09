import { Link } from "react-router-dom";
import { ArrowLeft, Book, Code, Zap, Shield, Terminal, ExternalLink } from "lucide-react";

const sections = [
  {
    title: "Quick Start",
    description: "Get your first agent wallet running in under 5 minutes",
    icon: Zap,
    links: ["Install SDK", "Create your first wallet", "Send your first payment"],
  },
  {
    title: "API Reference",
    description: "Complete reference for all Paysmith SDK methods",
    icon: Code,
    links: ["createAgentWallet()", "agent.receive()", "agent.pay()", "agent.balance()"],
  },
  {
    title: "Guides",
    description: "Step-by-step tutorials for common use cases",
    icon: Book,
    links: ["Multi-rail routing", "Policy enforcement", "Agent-to-agent settlement"],
  },
  {
    title: "Security",
    description: "Learn about our compliance and security model",
    icon: Shield,
    links: ["KYC/AML compliance", "Transaction policies", "Audit logging"],
  },
];

const Docs = () => (
  <div className="min-h-screen bg-background px-4 py-12 sm:py-20">
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to integrate Paysmith into your AI agents.
        </p>
      </div>

      {/* Quick Start Code Block */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium">Install the SDK</span>
        </div>
        <pre className="bg-secondary/50 rounded-xl p-4 text-sm font-mono text-foreground overflow-x-auto">
          <code>npm install @paysmith/sdk</code>
        </pre>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sections.map((s) => (
          <div key={s.title} className="rounded-xl border border-border bg-card p-6 hover:border-muted-foreground/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <s.icon size={20} className="text-foreground" />
              <h2 className="text-lg font-medium">{s.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{s.description}</p>
            <ul className="space-y-2">
              {s.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-foreground/80 hover:text-foreground flex items-center gap-1 transition-colors">
                    {link} <ExternalLink size={12} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Docs;
