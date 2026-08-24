# Flutterwave (Paysmith backup fiat rail)

**Updated:** 2026-08-23  
**Sources (live):** [Transfers introduction (v3)](https://developer.flutterwave.com/v3.0/docs/introduction-6), [IP whitelist help](https://flutterwave.com/mu/support/integrations/how-to-whitelist-ip-addresses-on-your-flutterwave-dashboard), [API response errors](https://developer.flutterwave.com/v2.0/reference/api-response), smoke logs `memory/SMOKE_FLUTTERWAVE.json`.

## What Paysmith uses

| Item | Value |
|------|--------|
| Role | **Backup** to Paystack for `method=bank_transfer` |
| API | **v3** `POST https://api.flutterwave.com/v3/transfers` |
| Auth | `Authorization: Bearer FLWSECK_TEST-…` |
| Test accounts (NG) | Access Bank `044` / `0690000031`–`0690000032` ([testing](https://developer.flutterwave.com/docs/testing)) |
| Code | `routeFlutterwave` in `supabase/functions/pay/index.ts`; smoke `npm run smoke:flutterwave` |

## Official prerequisites (before API transfers work)

From Flutterwave Transfers **Introduction**:

1. **Enable Transfer via API** in dashboard settings  
   → [Settings → Preferences / Security](https://app.flutterwave.com/dashboard/settings/preferences/security)  
   → turn on **Transfer via API**  
2. **Whitelist IPs** of servers that call the Transfer API  
   → Settings → Whitelisted IP addresses  

**Important:** Dashboard **Make a transfer** (Bank / MoMo / Stablecoin UI) is a **manual payout product**. It is **not** the same as enabling **Transfer via API**. Manual UI success does not guarantee API transfers.

## Errors we hit (fact-checked against smoke + docs)

| Error (live smoke) | Meaning | Doc / fix |
|--------------------|---------|-----------|
| `Please enable IP Whitelisting to access this service` | Caller IP not on whitelist | Whitelist IPv4; help center steps above. Some community notes: test mode `0.0.0.0` = allow all (unofficial; verify in your dashboard). |
| `merchant is not enabled to make transfers.` | Merchant not enabled for API disbursements | Same class as docs error *Merchant not enabled for API Disburse* — enable **Transfer via API** in security preferences; contact Flutterwave support if toggle missing. |

## Paysmith status (2026-08-23)

| Check | Result |
|-------|--------|
| Secret key on Edge | ✅ Set |
| Failover code (Paystack fail → FW; `preferRail`) | ✅ |
| IP whitelist (user PC `154.162.42.169`) | ✅ Cleared IP error |
| Transfer via API enabled | ❌ Still blocked (`merchant is not enabled to make transfers`) |
| Full settle smoke | ❌ Pending API enable |
| Ledger on FW fail | ✅ Not debited |

## Edge / Supabase note

`/pay` runs on **Supabase Edge** (dynamic egress). Whitelisting only the laptop IP fixes **local** `curl`/Node probes, **not** Edge calls, unless you also whitelist Edge egress or use allow-all for test. Prefer: enable Transfer via API + whitelist `0.0.0.0` in **test** only if Flutterwave allows it, or ask FW for Edge/static egress guidance.

## Do not claim

- “Flutterwave backup is production-ready” until Transfer via API is enabled and smoke settles.
- That picking **Transfer to Bank account** in the Make-a-transfer wizard alone activates the API.
