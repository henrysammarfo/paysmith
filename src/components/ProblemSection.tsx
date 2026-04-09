import { XCircle } from "lucide-react";

const PAIN_POINTS = [
  "No way to give an AI agent a mobile money wallet (MTN MoMo, Vodafone Cash, Airtel Money)",
  "No API that accepts GHS, NGN, or KES programmatically without a human in the loop",
  "No programmatic KYC — existing providers require manual document upload flows",
  "No spending policy enforcement — agents can overspend with no guardrails",
  "No agent-to-agent settlement — one agent cannot pay another natively",
  "No unified multi-rail router — every developer rebuilds from scratch every time",
];

const ProblemSection = () => {
  return (
    <section className="relative z-10 px-4 sm:px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3">
          The Problem
        </p>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] mb-4">
          The wall every African AI developer hits.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mb-12 md:mb-16">
          AI agents are being deployed across Africa at speed. Every single one
          hits the same wall the moment they need to transact.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAIN_POINTS.map((point, i) => (
            <div
              key={i}
              className="rounded-2xl liquid-glass p-5 sm:p-6 flex items-start gap-4"
            >
              <XCircle
                size={20}
                className="text-destructive/70 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-foreground/80 leading-relaxed">
                {point}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground italic max-w-xl">
          "I rebuilt this infrastructure four separate times — for MERX, Proxia,
          Tendra, and Remlo. Four projects. Four from-scratch builds. That's a
          market screaming for a product."
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
