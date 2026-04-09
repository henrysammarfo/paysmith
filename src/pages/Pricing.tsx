import { Link } from "react-router-dom";
import { Check, ArrowLeft, Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter",
    description: "For individual developers exploring agent payments",
    features: ["1 Agent Wallet", "100 transactions/month", "MTN MoMo", "Community support", "Sandbox API"],
    highlight: false,
  },
  {
    name: "Growth",
    description: "For teams building production agent workflows",
    features: ["25 Agent Wallets", "10,000 transactions/month", "All payment rails", "Priority support", "Webhooks & analytics", "Custom policies"],
    highlight: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale deployments with compliance needs",
    features: ["Unlimited wallets", "Unlimited transactions", "Dedicated account manager", "SLA guarantee", "On-premise option", "Custom compliance"],
    highlight: false,
  },
];

const Pricing = () => {
  const [notified, setNotified] = useState(false);

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            We're finalizing our plans. Pricing details coming soon.
          </p>
          <Button
            variant={notified ? "secondary" : "default"}
            onClick={() => setNotified(true)}
            disabled={notified}
            className="rounded-xl"
          >
            <Bell size={16} />
            {notified ? "You'll be notified!" : "Notify me when pricing is live"}
          </Button>
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
                <span className="text-2xl font-bold text-muted-foreground">Coming Soon</span>
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
                className="w-full rounded-xl py-3 font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-not-allowed opacity-60"
                disabled
              >
                Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
