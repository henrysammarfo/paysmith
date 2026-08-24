import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Sandbox",
    price: "Free",
    priceNote: "Testnet & PSP sandboxes",
    description: "For builders integrating AI agent wallets on Stellar testnet and licensed PSP test rails.",
    features: [
      "Unlimited test agent wallets",
      "Paystack MoMo (test) + Flutterwave bank (test)",
      "Stellar testnet XLM & Circle USDC",
      "Spending policies + KYC ceilings",
      "Idempotent /pay + webhook delivery",
      "Docs & API Playground",
    ],
    highlight: true,
    cta: "Join waitlist",
    ctaTo: "/#waitlist",
    disabled: false,
  },
  {
    name: "Growth",
    price: "Usage-based",
    priceNote: "After live KYB",
    description: "For teams moving from sandbox to live corridors (GHS / NGN first).",
    features: [
      "Live MoMo & bank rails via licensed PSPs",
      "Higher KYC/KYB tiers",
      "Webhooks & dashboard analytics",
      "Custom spending policies",
      "Priority support",
    ],
    highlight: false,
    cta: "Talk to us",
    ctaTo: "mailto:hello@paysmith.dev",
    disabled: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceNote: "SLA & compliance",
    description: "For regulated deployments, dedicated corridors, and audit requirements.",
    features: [
      "Dedicated onboarding & account manager",
      "SLA & volume agreements",
      "Enhanced compliance reviews",
      "Custom corridor enablement",
      "Security questionnaire support",
    ],
    highlight: false,
    cta: "Contact sales",
    ctaTo: "mailto:hello@paysmith.dev",
    disabled: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start on <strong className="text-foreground font-medium">sandbox & Stellar testnet for free</strong>.
            Live corridor pricing is usage-based after KYB — we do not charge for testnet activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                tier.highlight ? "border-primary bg-card" : "border-border bg-card"
              }`}
            >
              {tier.highlight && (
                <span className="text-xs font-medium bg-primary text-primary-foreground rounded-full px-3 py-1 self-start mb-4">
                  Start here
                </span>
              )}
              <h3 className="text-xl font-semibold">{tier.name}</h3>
              <div className="mt-3 mb-1">
                <span className="text-2xl font-bold text-foreground">{tier.price}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{tier.priceNote}</p>
              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {tier.ctaTo.startsWith("mailto:") ? (
                <a
                  href={tier.ctaTo}
                  className="w-full rounded-xl py-3 font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-center"
                >
                  {tier.cta}
                </a>
              ) : (
                <Button asChild className="w-full rounded-xl" variant={tier.highlight ? "default" : "secondary"}>
                  <Link to={tier.ctaTo}>{tier.cta}</Link>
                </Button>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10 max-w-xl mx-auto">
          Mainnet and live PSP corridors require business KYB. We never claim unhackable systems —
          see our threat model and residual risks in the docs.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
