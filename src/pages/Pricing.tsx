import { Link } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    description: "For individual developers exploring agent payments",
    features: ["1 Agent Wallet", "100 transactions/month", "MTN MoMo", "Community support", "Sandbox API"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$49",
    period: "/mo",
    description: "For teams building production agent workflows",
    features: ["25 Agent Wallets", "10,000 transactions/month", "All payment rails", "Priority support", "Webhooks & analytics", "Custom policies"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale deployments with compliance needs",
    features: ["Unlimited wallets", "Unlimited transactions", "Dedicated account manager", "SLA guarantee", "On-premise option", "Custom compliance"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background px-4 py-12 sm:py-20">
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Start free. Scale as your agents grow. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl border p-8 flex flex-col ${
              tier.highlight
                ? "border-primary bg-card"
                : "border-border bg-card"
            }`}
          >
            {tier.highlight && (
              <span className="text-xs font-medium bg-primary text-primary-foreground rounded-full px-3 py-1 self-start mb-4">
                Most Popular
              </span>
            )}
            <h3 className="text-xl font-semibold">{tier.name}</h3>
            <div className="mt-3 mb-2">
              <span className="text-4xl font-bold">{tier.price}</span>
              {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
            </div>
            <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

            <ul className="space-y-3 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={`w-full rounded-xl py-3 font-medium transition-colors ${
                tier.highlight
                  ? "bg-primary text-primary-foreground hover:bg-primary/80"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Pricing;
