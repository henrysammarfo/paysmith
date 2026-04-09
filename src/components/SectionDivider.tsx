const SectionDivider = () => (
  <div className="relative z-10 h-24 md:h-32 flex items-center justify-center overflow-hidden">
    {/* Horizontal glow line */}
    <div className="w-full max-w-4xl mx-auto px-8">
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--foreground) / 0.06) 15%, hsl(var(--foreground) / 0.15) 50%, hsl(var(--foreground) / 0.06) 85%, transparent 100%)",
        }}
      />
    </div>
    {/* Center dot accent */}
    <div className="absolute w-1.5 h-1.5 rounded-full bg-foreground/20" />
  </div>
);

export default SectionDivider;
