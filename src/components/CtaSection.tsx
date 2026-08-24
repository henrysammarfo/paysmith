import { useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CtaSection = () => {
  const [email, setEmail] = useState("");
  const [corridor, setCorridor] = useState("GH");
  const [loading, setLoading] = useState(false);

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("waitlist_signups").insert({
      email: email.trim().toLowerCase(),
      role: "builder",
      corridor,
      source: "landing_cta",
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast.info("You're already on the waitlist.");
      } else {
        toast.error("Could not join waitlist. Try again.");
      }
      return;
    }
    toast.success("You're on the builder waitlist — we'll reach out.");
    setEmail("");
  };

  return (
    <section id="waitlist" className="relative z-10 px-4 sm:px-6 md:px-12 py-20 md:py-32">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          <span className="inline-flex items-center rounded-full liquid-glass px-4 py-1.5 text-xs">
            Builder waitlist open
          </span>
          <span className="inline-flex items-center rounded-full liquid-glass px-4 py-1.5 text-xs">
            Built from Accra 🇬🇭
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-[-0.03em] mb-6">
          Give your AI agent a wallet today.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-10 max-w-xl mx-auto">
          Join the waitlist for a sandbox API key — install{" "}
          <code className="text-xs bg-secondary/50 px-1 rounded">@paysmithhq/sdk</code>{" "}
          anytime; calls need <code className="text-xs bg-secondary/50 px-1 rounded">ps_test_…</code> from us.
        </p>

        <form
          onSubmit={joinWaitlist}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8"
        >
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="flex-1 rounded-full liquid-glass px-5 py-3 text-sm bg-transparent outline-none border border-border/40"
          />
          <select
            value={corridor}
            onChange={(ev) => setCorridor(ev.target.value)}
            className="rounded-full liquid-glass px-4 py-3 text-sm bg-transparent border border-border/40"
            aria-label="Primary corridor"
          >
            <option value="GH">Ghana</option>
            <option value="NG">Nigeria</option>
            <option value="KE">Kenya</option>
            <option value="ZA">South Africa</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full font-medium bg-primary text-primary-foreground px-6 py-3 hover:bg-primary/80 transition-colors text-sm disabled:opacity-60"
          >
            {loading ? "Joining…" : "Join waitlist"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full font-medium px-8 py-3 hover:bg-primary/80 transition-colors"
          >
            <Play size={18} className="fill-primary-foreground" />
            Get Started Free
          </Link>
          <Link
            to="/docs"
            className="flex items-center gap-2 rounded-full font-medium liquid-glass px-8 py-3"
          >
            Read the Docs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
