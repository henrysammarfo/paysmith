# API Keys Setup — Paysmith (fill → copy → paste to agent)

Do these **in order**. After each step, paste the key back in chat (or into Supabase secrets — I'll tell you which).  
**Never commit keys to GitHub.** Use **TEST / SANDBOX** keys only for now.

> **Publishing `@paysmithhq/sdk` on npm:** follow **[`docs/NPM_PUBLISH_SETUP.md`](./NPM_PUBLISH_SETUP.md)** (org `paysmithhq` → granular token → paste here → I publish).

---

## Step 1 — Paystack (REQUIRED for fiat MoMo/bank) ⭐

1. Open: https://dashboard.paystack.com/#/signup  
2. Create account (use your Ghana/Nigeria business email if you have one).  
3. Complete email verification.  
4. Open: https://dashboard.paystack.com/#/settings/developer  
5. Make sure the toggle says **Test Mode** (not Live).  
6. Copy **Secret Key** — it starts with `sk_test_...`  

**Paste format:**
```
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx
```

Optional later: https://paystack.com/docs/transfers/introduction/

---

## Step 2 — Flutterwave (OPTIONAL backup rail)

1. Open: https://dashboard.flutterwave.com/signup  
2. Create account → verify email.  
3. Open: https://dashboard.flutterwave.com/dashboard/settings/apis  
4. Stay on **Test** environment.  
5. Copy **Secret Key** — starts with `FLWSECK_TEST-...`  

```
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxx
```

Skip this step if you only want Paystack for now.

---

## Step 3 — Stellar treasury (REQUIRED for USDC) ⭐

You have two options:

### Option A — I generate testnet keys for you (fastest)
Reply: **“generate stellar testnet treasury”**  
I will create a keypair, fund it via Friendbot, and give you:
```
STELLAR_TREASURY_SECRET=S....
STELLAR_TREASURY_PUBLIC=G....
STELLAR_NETWORK=testnet
```
You only store them in Supabase secrets / `.env` — do not tweet the secret.

### Option B — You create in Laboratory
1. Open: https://laboratory.stellar.org/#account-creator?network=test  
2. Click **Generate keypair**  
3. Copy **Secret Key** (`S...`) and **Public Key** (`G...`)  
4. Click **Fund account with Friendbot** (testnet XLM)  
5. Paste:

```
STELLAR_TREASURY_SECRET=Sxxxxxxxx
STELLAR_TREASURY_PUBLIC=Gxxxxxxxx
STELLAR_NETWORK=testnet
```

USDC issuer on testnet will be set in code from Circle docs (`STELLAR_USDC_ISSUER` override optional).

---

## Step 4 — Supabase Edge Function secrets (REQUIRED to run rails in cloud)

Your frontend already uses `VITE_SUPABASE_*`. Edge functions need secrets in the **Supabase project** (not only local `.env`).

1. Open your project: https://supabase.com/dashboard/project/_/settings/functions  
   (or: Dashboard → Project → **Edge Functions** → **Secrets**)  
2. Add these secrets (names exact):

| Name | Value |
|------|--------|
| `PAYSTACK_SECRET_KEY` | from Step 1 |
| `STELLAR_TREASURY_SECRET` | from Step 3 |
| `STELLAR_NETWORK` | `testnet` |
| `FLUTTERWAVE_SECRET_KEY` | from Step 2 (optional) |
| `WEBHOOK_INTERNAL_SECRET` | any long random string (optional extra) |

Also confirm these already exist (Lovable/Supabase usually set them):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

**Where to find service role (do not share publicly):**  
https://supabase.com/dashboard/project/_/settings/api → `service_role` `secret`

---

## Step 5 — Partna (LATER — not needed for first build)

When we hit P6: https://docs.getpartna.com → create account / request API access.  
Skip for now.

---

## Checklist — send me this block when done

```
PAYSTACK_SECRET_KEY=sk_test_...
STELLAR_TREASURY_SECRET=S...
STELLAR_TREASURY_PUBLIC=G...
STELLAR_NETWORK=testnet
FLUTTERWAVE_SECRET_KEY=   (optional, or write SKIP)
SUPABASE_PROJECT_REF=     (the id in your supabase URL, optional)
```

While you create keys, I’m building Stellar Horizon settlement + KYC schema against these env names.
