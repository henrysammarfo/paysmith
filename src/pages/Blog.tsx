import { Link } from "react-router-dom";
import { ArrowLeft, Clock, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const blogPosts = [
  {
    slug: "why-ai-agents-need-wallets",
    title: "Why AI Agents Need Their Own Wallets",
    excerpt: "As AI agents become autonomous actors in commerce, giving them dedicated payment infrastructure isn't a luxury — it's a necessity.",
    date: "2026-04-01",
    readTime: "5 min read",
    category: "Vision",
    content: `
The rise of autonomous AI agents is reshaping how businesses operate. From procurement bots negotiating with suppliers to customer service agents issuing refunds, AI is increasingly handling financial transactions on behalf of organizations.

## The Problem with Shared Accounts

Traditionally, these agents operate through shared corporate accounts or employee credentials. This creates several issues:

- **No auditability** — It's impossible to trace which agent initiated a specific payment.
- **Security risks** — Shared credentials mean a compromised agent can drain an entire account.
- **No spending controls** — Without per-agent policies, there's no way to enforce budgets or limits.

## The Wallet-Per-Agent Model

Paysmith introduces the concept of a dedicated wallet for each AI agent. Every wallet has its own balance, spending policies, and audit trail. This means:

1. **Granular control** — Set per-agent transaction limits, daily caps, and approval thresholds.
2. **Full traceability** — Every transaction is tagged to the specific agent that initiated it.
3. **Isolation** — A compromised agent can only access its own funds, limiting blast radius.
4. **Compliance** — Built-in KYC/AML checks at the wallet level ensure regulatory compliance.

## What This Means for Africa

In markets where mobile money dominates, agent wallets enable AI systems to interact with local payment rails natively. No more clunky bank integrations or manual reconciliation.

The future of AI commerce is autonomous, auditable, and compliant. And it starts with giving each agent its own wallet.
    `,
  },
  {
    slug: "multi-rail-payments-africa",
    title: "Multi-Rail Payments in Africa: A Technical Deep Dive",
    excerpt: "How Paysmith routes payments across mobile money, bank transfers, and card networks to optimize for cost, speed, and reliability.",
    date: "2026-03-20",
    readTime: "8 min read",
    category: "Engineering",
    content: `
Africa's payment landscape is uniquely fragmented. MTN MoMo dominates in Ghana, M-Pesa in Kenya, and bank transfers remain critical in Nigeria. Building a payment system that works across all these rails is a significant engineering challenge.

## The Routing Problem

When an AI agent needs to send a payment, the optimal rail depends on several factors:

- **Cost** — Mobile money fees vary by provider and transaction size.
- **Speed** — Bank transfers can take hours; mobile money is near-instant.
- **Availability** — Rails experience downtime and have capacity limits.
- **Recipient preference** — Some recipients only accept specific payment methods.

## How Paysmith Routes Payments

Our routing engine evaluates all available rails in real-time and selects the optimal path based on the developer's chosen strategy:

### Lowest Cost Routing

The engine compares fee structures across all enabled rails and routes through the cheapest option. This includes considering volume discounts and time-of-day pricing variations.

### Fastest Settlement

For time-sensitive payments, the engine prioritizes rails with the fastest settlement times. Mobile money typically wins here, settling in seconds compared to hours for bank transfers.

### Most Reliable

When uptime matters most, the engine routes through rails with the highest historical success rates. It maintains a real-time health score for each rail and automatically falls back to alternatives during outages.

## Fallback Chains

Developers can configure fallback chains to ensure payments always go through:

\`\`\`
preferred: mtn_momo → fallback: bank_transfer → fallback: card
\`\`\`

If the preferred rail fails, the system automatically retries on the next rail in the chain, all within the same API call.

## Conclusion

Multi-rail routing isn't just a convenience — it's a reliability feature. In markets where individual rails can be unpredictable, having intelligent routing ensures your AI agents can always complete their transactions.
    `,
  },
  {
    slug: "building-compliant-ai-payments",
    title: "Building Compliant AI Payment Systems",
    excerpt: "How to implement KYC, AML, and transaction monitoring for autonomous agent payments while staying compliant with African financial regulations.",
    date: "2026-03-10",
    readTime: "6 min read",
    category: "Compliance",
    content: `
Compliance is often an afterthought in AI development, but when your agents are handling real money, it needs to be built in from day one.

## Regulatory Landscape

African financial regulations vary by country, but common requirements include:

- **Know Your Customer (KYC)** — Identity verification for account holders.
- **Anti-Money Laundering (AML)** — Transaction monitoring and suspicious activity reporting.
- **Transaction limits** — Regulatory caps on mobile money and digital transactions.
- **Data localization** — Some countries require financial data to be stored locally.

## How Paysmith Handles Compliance

### Wallet-Level KYC

Each agent wallet can be assigned a KYC tier that determines its capabilities:

- **Tier 1** — Basic: low transaction limits, domestic only.
- **Tier 2** — Verified: higher limits, cross-border enabled.
- **Tier 3** — Enterprise: custom limits, full API access.

### Automated Transaction Monitoring

Paysmith's built-in monitoring system flags suspicious patterns:

- Unusual transaction volumes or amounts
- Rapid successive transactions (velocity checks)
- Transactions to/from high-risk jurisdictions
- Pattern anomalies based on historical behavior

### Policy Enforcement

Developers define policies at the wallet level that are enforced before any transaction is processed:

- Maximum transaction amounts
- Daily and monthly spending limits
- Approved recipient lists
- Geographic restrictions

### Audit Logging

Every action — from wallet creation to transaction completion — is logged with full context. These logs are immutable and queryable, making regulatory audits straightforward.

## Best Practices

1. Start with restrictive policies and loosen as you gain confidence.
2. Implement approval workflows for high-value transactions.
3. Review audit logs regularly for anomalies.
4. Keep KYC documentation up to date.

Building compliant AI payment systems isn't about checking boxes — it's about building trust with regulators, partners, and end users.
    `,
  },
  {
    slug: "paysmith-launch-announcement",
    title: "Announcing Paysmith: Payment Infrastructure for AI Agents",
    excerpt: "We're building the financial rails that let AI agents send, receive, and manage money autonomously across Africa.",
    date: "2026-03-01",
    readTime: "3 min read",
    category: "Announcement",
    content: `
Today, we're excited to announce Paysmith — payment infrastructure purpose-built for AI agents.

## Why We're Building This

The AI agent revolution is here. Companies are deploying autonomous agents for procurement, customer service, logistics, and more. But when these agents need to handle money, developers are forced to cobble together solutions using traditional payment APIs that were never designed for autonomous systems.

We believe AI agents deserve their own financial infrastructure — one that's built from the ground up for autonomy, compliance, and multi-rail flexibility.

## What Paysmith Offers

- **Agent Wallets** — Dedicated wallets with per-agent spending policies and audit trails.
- **Multi-Rail Routing** — Automatic routing across mobile money, bank transfers, and card networks.
- **Policy Enforcement** — Built-in transaction limits, approval workflows, and compliance checks.
- **Developer-First SDK** — A clean, typed API that makes integration a breeze.

## What's Next

We're currently in private beta with select partners in Ghana and Kenya. If you're building AI agents that handle payments, we'd love to talk.

Sign up for early access on our website, or reach out directly at hello@paysmith.dev.

Let's build the future of AI commerce together.
    `,
  },
];

const Blog = () => (
  <div className="min-h-screen bg-background px-4 py-12 sm:py-20">
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Insights on AI payments, fintech infrastructure, and building for Africa.
        </p>
      </div>

      <div className="space-y-8">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="block rounded-2xl border border-border bg-card p-6 sm:p-8 hover:border-muted-foreground/30 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-3 py-1">
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} /> {post.readTime}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-muted-foreground mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span className="text-sm text-foreground flex items-center gap-1 group-hover:gap-2 transition-all">
                Read more <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
    <Footer />
  </div>
);

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } else {
      toast.success("You're subscribed! We'll keep you posted.");
      setEmail("");
    }
  };

  return (
    <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
      <Mail className="mx-auto mb-4 text-primary" size={28} />
      <h2 className="text-2xl font-semibold mb-2">Stay in the loop</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Get the latest on AI payments, product updates, and engineering deep dives. No spam.
      </p>
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading} className="rounded-xl">
          {loading ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
    </div>
  );
}

export default Blog;
