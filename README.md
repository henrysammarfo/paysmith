<p align="center">
  <img src="src/assets/paysmith-logo.png" alt="Paysmith Logo" width="120" />
</p>

<h1 align="center">PAYSMITH</h1>
<p align="center"><strong>The Stripe for AI Agents in Africa</strong></p>
<p align="center">Give your AI agent a mobile money wallet in 3 lines of code.<br/>MTN MoMo, Vodafone Cash, bank transfers, and USDC — one API.</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#dashboard">Dashboard</a> •
  <a href="#security">Security</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## ✨ Features

- **3-Line Integration** — Create agent wallets and send payments in just 3 API calls
- **Multi-Rail Payments** — Mobile money (MTN MoMo, Vodafone Cash), bank transfers, crypto (USDC), and card
- **Multi-Currency** — NGN, GHS, and USDC with automatic FX rates
- **AI Agent Wallets** — Purpose-built wallets with spending policies (daily limits, single-tx caps, approval thresholds)
- **Webhook Delivery** — Real-time event notifications for transaction.settled, transaction.failed
- **API Key Management** — Separate live and test API keys with instant regeneration
- **Rate Limiting** — 100 req/min per key with `X-RateLimit-*` headers and 80% usage warnings
- **Developer Dashboard** — Real-time overview, transaction history, API usage analytics, webhook logs
- **Admin Metrics** — Platform-wide analytics (admin-only, role-based access)
- **Dark/Light Theme** — Full theme support across landing page and dashboard
- **Blog & Docs** — Built-in documentation and blog pages
- **API Playground** — Interactive endpoint testing from the browser

---

## 🚀 Quick Start

### 1. Sign Up

Create a developer account at the landing page → **Get Started**.

### 2. Get API Keys

After onboarding (create a wallet → grab your keys → configure webhooks), you'll have:
- `ps_live_*` — Production API key
- `ps_test_*` — Sandbox API key (uses sandbox payment rail)

### 3. Create an Agent Wallet

```bash
curl -X POST https://<your-project>.supabase.co/functions/v1/agents-create \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: ps_test_xxxx" \
  -d '{
    "name": "DeliveryBot",
    "currency": "NGN",
    "country": "NG",
    "paymentMethods": ["mobile_money", "bank_transfer"]
  }'
```

### 4. Send a Payment

```bash
curl -X POST https://<your-project>.supabase.co/functions/v1/pay \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: ps_test_xxxx" \
  -d '{
    "walletId": "wallet-id-here",
    "to": "+2348012345678",
    "amount": 5000,
    "currency": "NGN",
    "method": "mobile_money",
    "note": "Delivery fee"
  }'
```

### 5. Check Balance

```bash
curl https://<your-project>.supabase.co/functions/v1/agents-balance \
  -H "X-API-KEY: ps_test_xxxx"
```

---

## 📡 API Reference

### Authentication

All API endpoints authenticate via the `X-API-KEY` header. Use your live or test key.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/functions/v1/agents-create` | Create a new agent wallet |
| `GET` | `/functions/v1/agents-balance` | Get wallet balances |
| `POST` | `/functions/v1/pay` | Send a payment |

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/pay` | 100 requests | 1 minute |
| `/agents-create` | 20 requests | 1 minute |

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 82
X-RateLimit-Reset: 45
X-RateLimit-Warning: Usage at 82% (18 requests remaining)
```

When the limit is exceeded, a `429 Too Many Requests` response is returned with a `Retry-After` header.

### Payment Methods

| Method | Countries | Provider |
|--------|-----------|----------|
| `mobile_money` | GH, NG | Paystack (primary) |
| `bank_transfer` | GH, NG | Paystack → Flutterwave fallback |
| `crypto` / USDC | Global | **Stellar Horizon** (fails closed until treasury configured) |
| `card` | — | Not routed yet |

> Without Paystack/Flutterwave keys, fiat payments use the **sandbox** provider (instant settlement, 0.5% fee). Crypto never uses sandbox fake-settle.

### Spending Policies

Each wallet has configurable spending policies:

```json
{
  "dailyLimit": 10000,
  "maxSingleTx": 2000,
  "requireApprovalAbove": 5000
}
```

- Transactions exceeding `maxSingleTx` → `400`
- Transactions exceeding `requireApprovalAbove` → `402` (requires manual approval)
- Daily cumulative spend exceeding `dailyLimit` → `400`
- Insufficient ledger balance → `402`

### Webhooks

Configure a webhook URL in the dashboard to receive real-time events:

```json
{
  "event": "transaction.settled",
  "payload": {
    "txId": "ps_tx_abc123",
    "walletId": "wallet-id",
    "amount": 5000,
    "currency": "NGN",
    "method": "mobile_money",
    "recipient": "+2348012345678",
    "status": "settled",
    "fee": 25.00,
    "provider": "paystack",
    "timestamp": "2026-04-14T12:00:00.000Z"
  }
}
```

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS v3 |
| **UI Components** | shadcn/ui (Radix primitives) |
| **Charts** | Recharts |
| **Routing** | React Router v6 |
| **State** | TanStack React Query |
| **Backend** | Lovable Cloud (Supabase) |
| **Edge Functions** | Deno (Supabase Edge Functions) |
| **Database** | PostgreSQL with Row-Level Security |
| **Auth** | Supabase Auth |
| **Analytics** | PostHog |

### Database Schema

```
developers        — Developer accounts (auth_id, email, API keys, webhook config)
agent_wallets     — AI agent wallets (owner_id → developers, spending policies, balances)
transactions      — Payment transactions (agent_wallet_id → agent_wallets, immutable)
api_call_logs     — API usage tracking per developer
webhook_logs      — Webhook delivery history
profiles          — User profiles (name, avatar, company)
user_roles        — Role-based access (admin, user)
newsletter_subscribers — Email newsletter signups
```

### Edge Functions

| Function | Purpose |
|----------|---------|
| `pay` | Multi-rail payment router with rate limiting |
| `agents-create` | Wallet creation with rate limiting |
| `agents-balance` | Wallet balance queries |
| `track-api-call` | API usage logging |
| `webhook-deliver` | Async webhook delivery to developer endpoints |

### Security Model

- **Row-Level Security (RLS)** on all tables — developers only see their own data
- **Admin access** via `has_role()` SECURITY DEFINER function — no client-side role checks
- **API key auth** in edge functions — separate `.eq()` calls to prevent SQL injection
- **Input validation** on all endpoints (amount bounds, method whitelist, currency format, string length)
- **Rate limiting** with per-key sliding window (in-memory, per isolate)
- **Newsletter subscribers** — admin-only SELECT policy (no public email enumeration)
- **Transactions** — immutable (no UPDATE/DELETE policies)

---

## 📊 Dashboard

### Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview — stats, charts, recent transactions, API usage |
| `/dashboard/wallets` | Manage agent wallets |
| `/dashboard/transactions` | Full transaction history |
| `/dashboard/api-keys` | View/regenerate live & test API keys |
| `/dashboard/webhook-logs` | Webhook delivery history |
| `/dashboard/api-usage` | Detailed analytics — date range filtering, endpoint breakdown, success/error charts |
| `/dashboard/settings` | Account settings, webhook URL config |
| `/dashboard/metrics` | Admin-only platform metrics |

### Features

- **Real-time updates** via Supabase Realtime (new transactions appear instantly)
- **Rate limit banner** — warning alert when approaching 80% usage
- **Auto-refresh** — API usage stats poll every 30 seconds
- **Responsive** — optimized for mobile (390px+), tablet, and desktop
- **Collapsible sidebar** — compact mode with icon tooltips

---

## 🌍 Landing Page

- **Full-screen video background** with glassmorphism overlays
- **Animated hero** with blur-fade-up entrance animations
- **Interactive code section** showing 3-line integration
- **Problem → Solution narrative** explaining the African payment landscape
- **Feature grid** with hover effects
- **Moat section** — competitive advantages
- **CTA section** with newsletter signup
- **Responsive mobile menu** with full-screen overlay

---

## 🔐 Security

| Area | Implementation |
|------|----------------|
| Authentication | Email/password with email verification |
| Authorization | Role-based (admin/user) via `has_role()` SECURITY DEFINER |
| API Auth | API key header (`X-API-KEY`) |
| Data Isolation | RLS policies scope all data to owner |
| Rate Limiting | Sliding window per API key |
| Input Validation | Type, range, format checks on all inputs |
| SQL Injection | Parameterized queries, no `.or()` interpolation |
| Secrets | Stored in Lovable Cloud secrets, never in codebase |

---

## 📁 Project Structure

```
├── src/
│   ├── assets/              # Logo, social media assets
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── AdminRoute.tsx   # Admin role gate
│   │   ├── ProtectedRoute.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── OnboardingWizard.tsx
│   │   └── ApiUsageStats.tsx
│   ├── hooks/               # Custom hooks (useAuth, useTheme)
│   ├── pages/
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── Index.tsx        # Landing page
│   │   ├── Docs.tsx         # API documentation
│   │   ├── Blog.tsx         # Blog listing
│   │   └── Pricing.tsx      # Pricing page
│   ├── integrations/        # Supabase client & types (auto-generated)
│   └── lib/                 # Utilities (PostHog, cn)
├── supabase/
│   ├── functions/           # Edge functions (pay, agents-*, webhook-*)
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase config
└── public/                  # Static assets
```

---

## 🚢 Deployment

This project is built with Lovable and deploys automatically via the Lovable platform.

### Environment Variables (Auto-configured)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Optional Secrets (for production payment rails)

| Secret | Purpose |
|--------|---------|
| `PAYSTACK_SECRET_KEY` | Primary fiat (bank + MoMo) for NG/GH |
| `FLUTTERWAVE_SECRET_KEY` | Fiat bank-transfer fallback |
| `STELLAR_TREASURY_SECRET` | Stellar USDC settlement (Horizon) |
| `STELLAR_NETWORK` | `testnet` (default) or `mainnet` |
| `WEBHOOK_INTERNAL_SECRET` | Optional alt auth for webhook-deliver |

Without Paystack/Flutterwave, fiat routes through the sandbox provider. Crypto requires Stellar config.

---

## 📈 Analytics

- **PostHog** integration for product analytics
- Events tracked: `wallet_created`, `api_key_generated`, `webhook_configured`, `onboarding_step_completed`
- **API call logging** — every API call logged to `api_call_logs` with endpoint, method, status
- **Rate limit warnings** logged to `api_call_logs` as SYSTEM entries

---

## 🎨 Brand Assets

| Asset | File | Usage |
|-------|------|-------|
| Logo | `src/assets/paysmith-logo.png` | App icon, favicon, profile pic |
| LinkedIn Cover | `src/assets/paysmith-linkedin-cover.jpg` | LinkedIn banner (1584×396) |
| X/Twitter Cover | `src/assets/paysmith-x-cover.jpg` | X header (1504×512) |

---

## 📄 License

Proprietary. All rights reserved.
