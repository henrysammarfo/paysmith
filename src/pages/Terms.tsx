import { Link } from "react-router-dom";
import { useEffect } from "react";
import Footer from "@/components/Footer";

const Terms = () => {
  useEffect(() => {
    document.title = "Terms of Service — Paysmith";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Terms for using the Paysmith website, waitlist, and testnet sandbox API.",
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
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm mb-10 not-prose">
          Last updated: 17 October 2026 · Sandbox / waitlist product
        </p>

        <p>
          By using the Paysmith website, waitlist, or sandbox API, you agree to
          these terms. If you do not agree, do not use the service.
        </p>

        <h2>What Paysmith is</h2>
        <p>
          Paysmith provides a <strong>testnet / sandbox</strong> API for
          policy-bound agent wallets (Africa MoMo/bank sandboxes and Stellar
          testnet). We are <strong>not</strong> a licensed bank, VASP, or money
          transmitter. Sandbox balances and Stellar testnet assets have no cash
          value.
        </p>

        <h2>Eligibility</h2>
        <p>
          You must be at least 18 and able to form a binding contract. Sandbox
          keys are for builders and evaluation only — not for production
          customer funds.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>No abuse, scraping that degrades the service, or bypassing rate limits</li>
          <li>No attempting to use sandbox rails as live money movement</li>
          <li>No reverse-engineering to attack or impersonate Paysmith</li>
          <li>Keep API keys secret; you are responsible for keys issued to you</li>
        </ul>

        <h2>API &amp; uptime</h2>
        <p>
          The sandbox is provided &quot;as is&quot; without SLA. Features may
          change, break, or be withdrawn during beta. Idempotency and spending
          policies exist to reduce double-spend risk in sandbox; they are not a
          guarantee of production-grade compliance.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Site content, branding, and software are owned by Paysmith or its
          licensors. Open-source packages (e.g.{" "}
          <code>@paysmithhq/sdk</code>) are licensed under their published
          terms.
        </p>

        <h2>Disclaimer</h2>
        <p>
          To the fullest extent permitted by law, Paysmith disclaims warranties
          of merchantability, fitness for a particular purpose, and
          non-infringement. We do not warrant uninterrupted or error-free
          service.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          Paysmith is not liable for indirect, incidental, or consequential
          damages, or for loss of sandbox balances, keys, or opportunity arising
          from use of the beta.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms by posting a new version on this page. Continued
          use after changes constitutes acceptance.
        </p>

        <h2>Contact</h2>
        <p>
          <a href="mailto:hello@paysmith.dev" className="underline">
            hello@paysmith.dev
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
