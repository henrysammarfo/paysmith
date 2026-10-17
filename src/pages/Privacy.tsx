import { Link } from "react-router-dom";
import { useEffect } from "react";
import Footer from "@/components/Footer";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy — Paysmith";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "How Paysmith collects and uses data for the builder waitlist and sandbox API.",
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 sm:px-6 md:px-12 py-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Paysmith
        </Link>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 prose prose-invert prose-sm sm:prose-base">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 not-prose">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm mb-10 not-prose">
          Last updated: 17 October 2026 · Sandbox / waitlist product
        </p>

        <p>
          Paysmith (&quot;we&quot;) operates the website and sandbox API at
          paysmith-eight.vercel.app. We are not a licensed money transmitter or
          VASP. This policy covers the marketing site, builder waitlist, and
          developer sandbox.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Waitlist:</strong> email address, corridor preference (e.g.
            GH/NG/KE), and optional source tags.
          </li>
          <li>
            <strong>Sandbox accounts:</strong> developer email, API key metadata,
            wallet and transaction records needed to operate the testnet API.
          </li>
          <li>
            <strong>Technical logs:</strong> IP (for rate limits), user agent, and
            request paths on Edge functions.
          </li>
          <li>
            <strong>Cookies / local storage:</strong> theme preference, auth
            session (if you sign in), and cookie-consent choice. Analytics load
            only after consent.
          </li>
        </ul>

        <h2>How we use data</h2>
        <ul>
          <li>Send waitlist / sandbox onboarding email</li>
          <li>Operate and secure the sandbox API</li>
          <li>Understand site usage (analytics, only with consent)</li>
          <li>Improve product and prevent abuse</li>
        </ul>

        <h2>Sharing</h2>
        <p>
          We use processors such as Supabase (database / auth / Edge), Vercel
          (hosting), Resend (email), and payment sandbox providers (e.g.
          Paystack, Flutterwave) when you call those rails. We do not sell
          personal data.
        </p>

        <h2>Retention</h2>
        <p>
          Waitlist and sandbox records are kept while the beta operates, then
          deleted or anonymized on request unless we must retain them for
          security or legal reasons.
        </p>

        <h2>Your rights</h2>
        <p>
          Email{" "}
          <a href="mailto:hello@paysmith.dev" className="underline">
            hello@paysmith.dev
          </a>{" "}
          to access, correct, or delete waitlist / account data. You may
          withdraw cookie consent anytime via the banner controls (clear site
          data or reset consent in local storage).
        </p>

        <h2>Contact</h2>
        <p>
          Paysmith · Accra, Ghana ·{" "}
          <a href="mailto:hello@paysmith.dev" className="underline">
            hello@paysmith.dev
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
