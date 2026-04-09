import { Database, Network, Scale } from "lucide-react";

const MOATS = [
  {
    icon: Database,
    title: "Data Moat",
    description:
      "Every transaction teaches the routing engine which mobile money rails are fastest, cheapest, and most reliable in each country at each time of day. After 6 months of production traffic, this routing intelligence is impossible to replicate.",
  },
  {
    icon: Network,
    title: "Network Moat",
    description:
      "Agent A pays Agent B via Paysmith. Agent B is now on Paysmith. As more agents join, Paysmith becomes the standard settlement layer for inter-agent transactions in Africa — exactly like Stripe's network effect.",
  },
  {
    icon: Scale,
    title: "Compliance Moat",
    description:
      "Getting regulatory approval in Ghana, Nigeria, and Kenya simultaneously is 18–24 months of work with deep local relationships. Once done, it is an enormous barrier to entry for any competitor.",
  },
];

const MoatSection = () => {
  return (
    <section className="relative z-10 px-4 sm:px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3">
          Why We Win
        </p>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] mb-4">
          Three compounding advantages.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mb-12 md:mb-16">
          Each moat strengthens the others. Time is the ultimate lock-in.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {MOATS.map((moat, i) => (
            <div
              key={moat.title}
              className="rounded-2xl liquid-glass p-6 sm:p-8 flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center mb-6">
                <moat.icon size={22} className="text-foreground/80" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Moat {i + 1}
              </span>
              <h3 className="text-lg font-medium mb-3">{moat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {moat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoatSection;
