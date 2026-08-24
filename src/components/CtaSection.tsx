import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CORRIDORS = [
  { value: "GH", label: "Ghana" },
  { value: "NG", label: "Nigeria" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
] as const;

async function joinWaitlistApi(body: {
  email: string;
  corridor: string;
  source: string;
}) {
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const res = await fetch(`${base}/functions/v1/waitlist-join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? "Could not join waitlist");
  }
  return data as { ok: boolean; duplicate?: boolean; emailSent?: boolean };
}

const CtaSection = () => {
  const [email, setEmail] = useState("");
  const [corridor, setCorridor] = useState("GH");
  const [loading, setLoading] = useState(false);

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const result = await joinWaitlistApi({
        email: email.trim().toLowerCase(),
        corridor,
        source: "landing_cta",
      });
      if (result.duplicate) {
        toast.info(
          result.emailSent
            ? "You're already on the waitlist — check your inbox."
            : "You're already on the waitlist.",
        );
      } else {
        toast.success(
          result.emailSent
            ? "You're on the list — check your email for confirmation."
            : "You're on the builder waitlist — we'll reach out soon.",
        );
      }
      setEmail("");
    } catch {
      toast.error("Could not join waitlist. Try again.");
    } finally {
      setLoading(false);
    }
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
          <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">@paysmithhq/sdk</code>{" "}
          anytime; calls need <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">ps_test_…</code> from us.
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
            className="flex-1 min-w-0 rounded-full liquid-glass px-5 py-3 text-sm bg-transparent outline-none border border-white/20"
          />
          <Select value={corridor} onValueChange={setCorridor}>
            <SelectTrigger
              aria-label="Primary corridor"
              className="h-auto w-full sm:w-[9.5rem] shrink-0 rounded-full liquid-glass px-4 py-3 text-sm bg-transparent border border-white/20 shadow-none focus:ring-0 focus:ring-offset-0"
            >
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/15 bg-neutral-950/95 text-white backdrop-blur-xl">
              {CORRIDORS.map(({ value, label }) => (
                <SelectItem
                  key={value}
                  value={value}
                  className="text-sm focus:bg-white/10 focus:text-white"
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-full font-medium bg-primary text-primary-foreground px-6 py-3 hover:bg-primary/80 transition-colors text-sm disabled:opacity-60"
          >
            {loading ? "Joining…" : "Join waitlist"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="#waitlist"
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full font-medium px-8 py-3 hover:bg-primary/80 transition-colors scroll-smooth"
          >
            Join waitlist
          </a>
          <Link
            to="/docs"
            className="landing-btn-ghost flex items-center gap-2 rounded-full font-medium liquid-glass px-8 py-3"
          >
            <BookOpen size={18} />
            Read the Docs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
