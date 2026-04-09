import { Play, Star } from "lucide-react";

const CtaSection = () => {
  return (
    <section className="relative z-10 px-4 sm:px-6 md:px-12 py-20 md:py-32">
      <div className="max-w-3xl mx-auto text-center">
        {/* Badges */}
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full liquid-glass px-4 py-1.5 text-xs font-medium">
            <Star size={14} className="fill-foreground" />
            YC W26
          </span>
          <span className="inline-flex items-center rounded-full liquid-glass px-4 py-1.5 text-xs">
            Stellar WA Residency
          </span>
          <span className="inline-flex items-center rounded-full liquid-glass px-4 py-1.5 text-xs">
            Built from Accra 🇬🇭
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-[-0.03em] mb-6">
          Give your AI agent a wallet today.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-10 max-w-xl mx-auto">
          Three lines of code. MTN MoMo, Vodafone Cash, bank transfers, and
          USDC. One API. Start building in minutes.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full font-medium px-8 py-3 hover:bg-primary/80 transition-colors">
            <Play size={18} className="fill-primary-foreground" />
            Get Started Free
          </button>
          <button className="flex items-center gap-2 rounded-full font-medium liquid-glass px-8 py-3">
            Read the Docs
          </button>
        </div>

      </div>
    </section>
  );
};

export default CtaSection;
