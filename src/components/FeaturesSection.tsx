import {
  Fingerprint,
  ArrowRightLeft,
  ShieldCheck,
  Users,
  Radio,
  RefreshCcw,
  Coins,
  FileSearch,
} from "lucide-react";

const FEATURES = [
  {
    icon: Fingerprint,
    title: "Agent Identity + KYC",
    description:
      "Programmatic KYC — no manual document upload. Agent wallets are compliance-ready from creation.",
  },
  {
    icon: ArrowRightLeft,
    title: "Multi-Rail Router",
    description:
      "Auto-routes to fastest, cheapest rail: MTN MoMo → Vodafone Cash → Airtel → bank transfer → USDC.",
  },
  {
    icon: ShieldCheck,
    title: "Spending Policy Enforcement",
    description:
      "Daily limits, per-tx caps, approval thresholds — enforced at API level before any transaction.",
  },
  {
    icon: Users,
    title: "Agent-to-Agent Settlement",
    description:
      "Agent A pays Agent B directly. No intermediary. Settlement in seconds.",
  },
  {
    icon: Radio,
    title: "Real-Time Webhooks",
    description:
      "Every payment event fires immediately. Agents react to payment state in real time.",
  },
  {
    icon: RefreshCcw,
    title: "Multi-Currency FX",
    description:
      "Automatic conversion GHS↔NGN↔KES↔UGX↔USDC. 0.3% FX spread. Transparent.",
  },
  {
    icon: Coins,
    title: "Stablecoin Settlement",
    description:
      "Every mobile money wallet can receive/send USDC for cross-border settlement. One API, both rails.",
  },
  {
    icon: FileSearch,
    title: "Audit Trail",
    description:
      "Every transaction logged with intent, policy evaluation, rail chosen, outcome. Compliance-grade.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative z-10 px-4 sm:px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3">
          What Paysmith Handles
        </p>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] mb-4">
          Everything an agent needs to transact.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mb-12 md:mb-16">
          A single API. Three lines of code. Any developer in Africa gives their
          AI agent a complete payment identity.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl liquid-glass p-5 sm:p-6 group"
            >
              <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center mb-4">
                <feature.icon
                  size={18}
                  className="text-foreground/80"
                />
              </div>
              <h3 className="text-sm font-medium mb-2">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
