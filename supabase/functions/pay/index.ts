import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key, idempotency-key",
};

/** Stellar 14 Demo Day redeploy (2026-10-17). Remap pre-v3 IDs if Edge secret not refreshed. */
const SOROBAN_POLICY_V3 =
  "CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW";
const SOROBAN_POLICY_LEGACY = new Set([
  "CAHFJKHA7O75475ZI4Y4C6W6PIAR5MZUSNDKPNKADJ7KEHR7XNSTGMBE",
  "CAOJF27FUDJB3IAH27QYDE6HVLKC7R7VCUBAZ64Y3VLKIQDQ2WTMW5ZY",
]);

function resolveSorobanPolicyContractId(): string {
  const raw = (Deno.env.get("STELLAR_SOROBAN_POLICY_CONTRACT_ID") || "").trim();
  if (!raw.startsWith("C")) return SOROBAN_POLICY_V3;
  if (SOROBAN_POLICY_LEGACY.has(raw)) return SOROBAN_POLICY_V3;
  return raw;
}

// ── In-memory rate limiter (per isolate) ───────────────────────────
const RATE_LIMIT = 100; // requests per minute per key
const RATE_WINDOW = 60_000; // 60 seconds
const rateBuckets = new Map<string, number[]>();

function checkRateLimit(key: string): { allowed: boolean; retryAfter: number; remaining: number; reset: number } {
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) ?? []).filter(t => now - t < RATE_WINDOW);
  const reset = timestamps.length > 0 ? Math.ceil((timestamps[0] + RATE_WINDOW - now) / 1000) : Math.ceil(RATE_WINDOW / 1000);
  if (timestamps.length >= RATE_LIMIT) {
    const retryAfter = Math.ceil((timestamps[0] + RATE_WINDOW - now) / 1000);
    rateBuckets.set(key, timestamps);
    return { allowed: false, retryAfter, remaining: 0, reset };
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return { allowed: true, retryAfter: 0, remaining: RATE_LIMIT - timestamps.length, reset };
}

// ── Multi-Rail Router ───────────────────────────────────────────────
// Fiat: Paystack (primary) → Flutterwave (fallback). Chimoney removed (dead).
// Crypto/USDC: Stellar Horizon path (requires STELLAR_TREASURY_SECRET).
// Falls back to sandbox stub when keys are missing.

interface RailResult {
  railTxId: string;
  status: "settled" | "pending" | "failed";
  fee: number;
  provider: string;
  stellarTxHash?: string;
  errorDetail?: string;
}

async function routePaystack(opts: {
  method: string;
  currency: string;
  amount: number;
  to: string;
  note?: string;
  bankCode?: string;
}): Promise<RailResult | null> {
  const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!paystackKey) return null;
  if (opts.method !== "bank_transfer" && opts.method !== "mobile_money") return null;

  const reference = `ps_ps_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  // Paystack amounts are in kobo/pesewas (minor units) for NGN/GHS
  const amountMinor = Math.round(opts.amount * 100);

  try {
    const recipientType = opts.method === "mobile_money" ? "mobile_money" : "nuban";
    const recipientBody: Record<string, unknown> = {
      type: recipientType,
      name: "Paysmith payout",
      currency: opts.currency,
      account_number: opts.to,
    };
    // Paystack MoMo uses bank_code for the telco (e.g. MTN), not "provider"
    if (opts.method === "bank_transfer") {
      recipientBody.bank_code = opts.bankCode || Deno.env.get("PAYSTACK_DEFAULT_BANK_CODE") || "058";
    } else {
      recipientBody.bank_code =
        opts.bankCode || Deno.env.get("PAYSTACK_MOMO_PROVIDER") || "MTN";
    }

    const recipRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipientBody),
    });

    if (!recipRes.ok) {
      const errText = await recipRes.text();
      console.error("Paystack recipient error:", errText);
      return {
        railTxId: reference,
        status: "failed",
        fee: 0,
        provider: "paystack",
        errorDetail: errText.slice(0, 400),
      };
    }

    const recip = await recipRes.json();
    const recipientCode = recip?.data?.recipient_code;
    if (!recipientCode) {
      return {
        railTxId: reference,
        status: "failed",
        fee: 0,
        provider: "paystack",
        errorDetail: "missing recipient_code",
      };
    }

    const txRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amountMinor,
        recipient: recipientCode,
        reason: opts.note || "Paysmith payout",
        reference,
      }),
    });

    if (!txRes.ok) {
      const errText = await txRes.text();
      console.error("Paystack transfer error:", errText);
      return {
        railTxId: reference,
        status: "failed",
        fee: 0,
        provider: "paystack",
        errorDetail: errText.slice(0, 400),
      };
    }

    const result = await txRes.json();
    const statusRaw = (result?.data?.status || "").toLowerCase();
    return {
      railTxId: result?.data?.transfer_code || reference,
      status: statusRaw === "success" || statusRaw === "successful" ? "settled" : "pending",
      fee: opts.amount * 0.01,
      provider: "paystack",
    };
  } catch (e) {
    console.error("Paystack call failed:", e);
    return null;
  }
}

async function routeDaraja(opts: {
  method: string;
  currency: string;
  amount: number;
  to: string;
  note?: string;
}): Promise<RailResult | null> {
  const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET");
  if (!consumerKey || !consumerSecret) return null;
  if (opts.method !== "mobile_money") return null;
  if (opts.currency !== "KES") return null;

  const envName = (Deno.env.get("DARAJA_ENV") || "sandbox").toLowerCase();
  const base =
    envName === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";
  const initiator = Deno.env.get("DARAJA_INITIATOR_NAME") || "testapi";
  const shortcode = Deno.env.get("DARAJA_SHORTCODE") || "600986";
  const securityCredential = Deno.env.get("DARAJA_SECURITY_CREDENTIAL");
  const resultUrl =
    Deno.env.get("DARAJA_RESULT_URL") ||
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/daraja-callback`;
  const timeoutUrl =
    Deno.env.get("DARAJA_TIMEOUT_URL") || resultUrl;

  // Normalize MSISDN to 2547XXXXXXXX
  let msisdn = opts.to.replace(/\D/g, "");
  if (msisdn.startsWith("0")) msisdn = `254${msisdn.slice(1)}`;
  if (msisdn.startsWith("7") && msisdn.length === 9) msisdn = `254${msisdn}`;
  if (!/^2547\d{8}$/.test(msisdn)) {
    return {
      railTxId: `daraja_bad_msisdn`,
      status: "failed",
      fee: 0,
      provider: "daraja",
      errorDetail: "PartyB must be Kenyan MSISDN 2547XXXXXXXX",
    };
  }

  if (!securityCredential) {
    return {
      railTxId: `daraja_missing_sec`,
      status: "failed",
      fee: 0,
      provider: "daraja",
      errorDetail:
        "Set DARAJA_SECURITY_CREDENTIAL from Daraja portal → APIs → M-Pesa → Test Credentials",
    };
  }

  try {
    const basic = btoa(`${consumerKey}:${consumerSecret}`);
    const tokRes = await fetch(
      `${base}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${basic}` } },
    );
    if (!tokRes.ok) {
      const errText = await tokRes.text();
      return {
        railTxId: `daraja_oauth_err`,
        status: "failed",
        fee: 0,
        provider: "daraja",
        errorDetail: errText.slice(0, 300),
      };
    }
    const tok = await tokRes.json();
    const accessToken = tok.access_token as string;

    const amountInt = Math.max(1, Math.round(opts.amount));
    const body = {
      InitiatorName: initiator,
      SecurityCredential: securityCredential,
      CommandID: "BusinessPayment",
      Amount: amountInt,
      PartyA: shortcode,
      PartyB: msisdn,
      Remarks: (opts.note || "Paysmith payout").slice(0, 100),
      QueueTimeOutURL: timeoutUrl,
      ResultURL: resultUrl,
      Occasion: "Paysmith",
    };

    const payRes = await fetch(`${base}/mpesa/b2c/v1/paymentrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payText = await payRes.text();
    let payJson: Record<string, unknown> = {};
    try {
      payJson = JSON.parse(payText);
    } catch {
      /* raw */
    }

    const responseCode = String(payJson.ResponseCode ?? "");
    const conversationId = String(
      payJson.ConversationID ?? payJson.OriginatorConversationID ?? "",
    );
    if (payRes.ok && (responseCode === "0" || conversationId)) {
      return {
        railTxId: conversationId || `daraja_${crypto.randomUUID().slice(0, 12)}`,
        status: "pending", // B2C is async — ResultURL confirms
        fee: amountInt * 0.01,
        provider: "daraja",
      };
    }
    return {
      railTxId: conversationId || `daraja_err`,
      status: "failed",
      fee: 0,
      provider: "daraja",
      errorDetail: payText.slice(0, 400),
    };
  } catch (e) {
    return {
      railTxId: `daraja_err`,
      status: "failed",
      fee: 0,
      provider: "daraja",
      errorDetail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function routeMtnMomo(opts: {
  method: string;
  currency: string;
  amount: number;
  to: string;
  note?: string;
}): Promise<RailResult | null> {
  const subscriptionKey = Deno.env.get("MTN_MOMO_DISBURSEMENT_SUBSCRIPTION_KEY") ||
    Deno.env.get("MTN_MOMO_SUBSCRIPTION_KEY");
  const apiUser = Deno.env.get("MTN_MOMO_API_USER");
  const apiKey = Deno.env.get("MTN_MOMO_API_KEY");
  if (!subscriptionKey || !apiUser || !apiKey) return null;
  if (opts.method !== "mobile_money") return null;
  // Sandbox accepts any currency code; production target env is country-specific
  const targetEnv = Deno.env.get("MTN_MOMO_TARGET_ENV") || "sandbox";
  const base = "https://sandbox.momodeveloper.mtn.com";

  let msisdn = opts.to.replace(/\D/g, "");
  if (msisdn.startsWith("0")) msisdn = msisdn.slice(1);

  const referenceId = crypto.randomUUID();
  try {
    const basic = btoa(`${apiUser}:${apiKey}`);
    const tokRes = await fetch(`${base}/disbursement/token/`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    });
    if (!tokRes.ok) {
      const errText = await tokRes.text();
      return {
        railTxId: referenceId,
        status: "failed",
        fee: 0,
        provider: "mtn_momo",
        errorDetail: `token ${tokRes.status}: ${errText.slice(0, 200)} — subscribe Disbursements product if 401`,
      };
    }
    const tok = await tokRes.json();
    const accessToken = tok.access_token as string;

    const amountStr = opts.amount.toFixed(2);
    // MTN sandbox only accepts EUR; production uses corridor currency (e.g. GHS with X-Target-Environment mtnghana)
    const railCurrency =
      targetEnv === "sandbox"
        ? Deno.env.get("MTN_MOMO_SANDBOX_CURRENCY") || "EUR"
        : opts.currency;
    const payRes = await fetch(`${base}/disbursement/v1_0/transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": targetEnv,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountStr,
        currency: railCurrency,
        externalId: referenceId.slice(0, 24),
        payee: { partyIdType: "MSISDN", partyId: msisdn },
        payerMessage: (opts.note || "Paysmith").slice(0, 50),
        payeeNote: "Paysmith payout",
      }),
    });

    if (payRes.status === 202 || payRes.ok) {
      return {
        railTxId: referenceId,
        status: "pending",
        fee: Number(amountStr) * 0.01,
        provider: "mtn_momo",
      };
    }
    const errText = await payRes.text();
    return {
      railTxId: referenceId,
      status: "failed",
      fee: 0,
      provider: "mtn_momo",
      errorDetail: errText.slice(0, 400),
    };
  } catch (e) {
    return {
      railTxId: referenceId,
      status: "failed",
      fee: 0,
      provider: "mtn_momo",
      errorDetail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function routeFlutterwave(opts: {
  method: string;
  currency: string;
  amount: number;
  to: string;
  note?: string;
  bankCode?: string;
}): Promise<RailResult | null> {
  const flutterwaveKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
  if (!flutterwaveKey || opts.method !== "bank_transfer") return null;

  // _PMCK suffix forces SUCCESS in Flutterwave test mode (see their testing docs)
  const reference = `ps_fw_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}_PMCK`;

  try {
    const fwRes = await fetch("https://api.flutterwave.com/v3/transfers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${flutterwaveKey}`,
      },
      body: JSON.stringify({
        account_bank: opts.bankCode || Deno.env.get("FLUTTERWAVE_DEFAULT_BANK_CODE") || "044",
        account_number: opts.to,
        amount: opts.amount,
        currency: opts.currency,
        narration: opts.note || "Paysmith payout",
        reference,
      }),
    });

    if (!fwRes.ok) {
      const errText = await fwRes.text();
      console.error("Flutterwave error:", errText);
      return {
        railTxId: reference,
        status: "failed",
        fee: 0,
        provider: "flutterwave",
        errorDetail: errText.slice(0, 400),
      };
    }

    const result = await fwRes.json();
    if (result?.status === "error") {
      return {
        railTxId: reference,
        status: "failed",
        fee: 0,
        provider: "flutterwave",
        errorDetail: JSON.stringify(result).slice(0, 400),
      };
    }
    const statusRaw = (result?.data?.status || "").toUpperCase();
    return {
      railTxId: result?.data?.id?.toString() || reference,
      status: statusRaw === "SUCCESS" || statusRaw === "SUCCESSFUL" ? "settled" : "pending",
      fee: opts.amount * 0.015,
      provider: "flutterwave",
    };
  } catch (e) {
    console.error("Flutterwave call failed:", e);
    return null;
  }
}

/** Stellar settlement via Horizon — native XLM (testnet) or USDC credit asset. */
async function routeStellarPayment(opts: {
  amount: number;
  to: string;
  note?: string;
  currency: string;
}): Promise<RailResult | null> {
  const secret = Deno.env.get("STELLAR_TREASURY_SECRET");
  if (!secret) return null;

  const network = (Deno.env.get("STELLAR_NETWORK") || "testnet").toLowerCase();
  const horizonUrl =
    Deno.env.get("STELLAR_HORIZON_URL") ||
    (network === "mainnet"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org");

  // Destination must be a Stellar public key (G...)
  if (!opts.to.startsWith("G") || opts.to.length < 56) {
    return {
      railTxId: `stellar_bad_dest_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`,
      status: "failed",
      fee: 0,
      provider: "stellar",
    };
  }

  try {
    // Prefer npm: for Supabase Edge; esm.sh as fallback
    let StellarSdk: any;
    try {
      StellarSdk = await import("npm:@stellar/stellar-sdk@14.2.0");
    } catch {
      StellarSdk = await import("https://esm.sh/@stellar/stellar-sdk@14.2.0");
    }
    const {
      Keypair,
      Horizon,
      TransactionBuilder,
      Networks,
      Operation,
      Asset,
      StrKey,
      Memo,
    } = StellarSdk;

    if (!StrKey.isValidEd25519SecretSeed(secret)) {
      console.error("STELLAR_TREASURY_SECRET is not a valid Stellar secret seed");
      return {
        railTxId: `stellar_bad_secret`,
        status: "failed",
        fee: 0,
        provider: "stellar",
        errorDetail: "invalid treasury secret seed",
      };
    }
    if (!StrKey.isValidEd25519PublicKey(opts.to)) {
      return {
        railTxId: `stellar_bad_dest`,
        status: "failed",
        fee: 0,
        provider: "stellar",
        errorDetail: "invalid destination public key",
      };
    }

    const sourceKeys = Keypair.fromSecret(secret);
    const server = new Horizon.Server(horizonUrl);
    const account = await server.loadAccount(sourceKeys.publicKey());

    const currency = opts.currency.toUpperCase();
    let asset = Asset.native();
    let amountStr = opts.amount.toFixed(7);

    if (currency === "USDC") {
      // Circle USDC on Stellar — testnet issuer from Circle docs; mainnet is different
      const issuer =
        Deno.env.get("STELLAR_USDC_ISSUER") ||
        (network === "mainnet"
          ? "GA5ZSEJYB37JRC5RIEN5NS3XKVKJEVNQQAPYP37GTDDSXBEEXP8AF7OC"
          : "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");
      const code = Deno.env.get("STELLAR_USDC_CODE") || "USDC";
      asset = new Asset(code, issuer);
      amountStr = opts.amount.toFixed(7);
    } else if (currency !== "XLM") {
      return {
        railTxId: `stellar_unsupported_asset_${currency}`,
        status: "failed",
        fee: 0,
        provider: "stellar",
        errorDetail: `unsupported asset ${currency}`,
      };
    }

    const fee = await server.fetchBaseFee();
    const networkPassphrase = network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

    let txBuilder = new TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase,
    }).addOperation(
      Operation.payment({
        destination: opts.to,
        asset,
        amount: amountStr,
      })
    );

    if (opts.note && opts.note.length <= 28 && Memo) {
      txBuilder = txBuilder.addMemo(Memo.text(opts.note.slice(0, 28)));
    }

    const transaction = txBuilder.setTimeout(180).build();
    transaction.sign(sourceKeys);

    const result = await server.submitTransaction(transaction);
    const hash = result.hash || result.id;

    return {
      railTxId: hash,
      status: "settled",
      fee: Number(fee) / 1e7,
      provider: "stellar",
      stellarTxHash: hash,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    let detail = msg.slice(0, 400);
    try {
      const data = (e as { response?: { data?: Record<string, unknown> } })?.response?.data;
      if (data) {
        const codes = (data as { extras?: { result_codes?: unknown } }).extras?.result_codes;
        detail = JSON.stringify({
          title: data.title,
          result_codes: codes ?? null,
          detail: typeof data.detail === "string" ? data.detail.slice(0, 180) : null,
        }).slice(0, 500);
      }
    } catch {
      /* keep msg */
    }
    console.error("Stellar Horizon settlement failed:", detail);
    return {
      railTxId: `stellar_err_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`,
      status: "failed",
      fee: 0,
      provider: "stellar",
      errorDetail: detail,
    };
  }
}

async function routePayment(opts: {
  method: string;
  country: string;
  currency: string;
  amount: number;
  to: string;
  note?: string;
  bankCode?: string;
  preferRail?: string;
}): Promise<RailResult> {
  const { method, currency, amount, to, note, bankCode, preferRail } = opts;
  const prefer = (preferRail || "").toLowerCase();

  // Crypto / USDC / XLM → Stellar Horizon only
  if (method === "crypto" || currency === "USDC" || currency === "XLM") {
    const stellar = await routeStellarPayment({ amount, to, note, currency: currency === "USDC" || currency === "XLM" ? currency : "USDC" });
    if (stellar) return stellar;
    return {
      railTxId: `ps_stellar_unconfigured_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`,
      status: "failed",
      fee: 0,
      provider: "stellar_unconfigured",
    };
  }

  // Explicit rail preference (sandbox drills)
  if (prefer === "daraja") {
    const daraja = await routeDaraja({ method, currency, amount, to, note });
    if (daraja) return daraja;
    return {
      railTxId: `daraja_unconfigured`,
      status: "failed",
      fee: 0,
      provider: "daraja",
      errorDetail: "Daraja unavailable — set DARAJA_* secrets",
    };
  }
  if (prefer === "mtn" || prefer === "mtn_momo") {
    const mtn = await routeMtnMomo({ method, currency, amount, to, note });
    if (mtn) return mtn;
    return {
      railTxId: `mtn_unconfigured`,
      status: "failed",
      fee: 0,
      provider: "mtn_momo",
      errorDetail: "MTN MoMo unavailable — subscribe Disbursements + set MTN_MOMO_*",
    };
  }

  // KES MoMo → Daraja first
  if (method === "mobile_money" && currency === "KES") {
    const daraja = await routeDaraja({ method, currency, amount, to, note });
    if (daraja && daraja.status !== "failed") return daraja;
    if (daraja?.status === "failed") return daraja;
  }

  // Explicit Flutterwave preference (test/sandbox failover drills)
  if (prefer === "flutterwave") {
    const flutterwave = await routeFlutterwave({ method, currency, amount, to, note, bankCode });
    if (flutterwave) return flutterwave;
    return {
      railTxId: `fw_unconfigured`,
      status: "failed",
      fee: 0,
      provider: "flutterwave",
      errorDetail: "Flutterwave unavailable for this method/currency",
    };
  }

  // Paystack primary — only accept non-failed; otherwise failover
  const paystack = await routePaystack({ method, currency, amount, to, note, bankCode });
  if (paystack && paystack.status !== "failed") return paystack;

  const flutterwave = await routeFlutterwave({ method, currency, amount, to, note, bankCode });
  if (flutterwave && flutterwave.status !== "failed") return flutterwave;

  // Prefer last concrete rail error over sandbox when providers are configured
  if (flutterwave?.status === "failed") return flutterwave;
  if (paystack?.status === "failed") return paystack;

  // Sandbox fallback (no provider keys / local demo only)
  return {
    railTxId: `ps_tx_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    status: "settled",
    fee: amount * 0.005,
    provider: "sandbox",
  };
}

function resolveSpendingPolicy(wallet: Record<string, unknown>): {
  dailyLimit: number;
  maxSingleTx: number;
  requireApprovalAbove: number;
} {
  const raw = wallet.spending_policy as
    | { dailyLimit?: number; maxSingleTx?: number; requireApprovalAbove?: number }
    | null
    | undefined;
  // Live schema columns: daily_cap, max_per_tx
  const dailyCap = wallet.daily_cap ?? wallet.daily_limit ?? 10000;
  const maxPerTx = wallet.max_per_tx ?? wallet.max_single_tx ?? 2000;
  if (raw && typeof raw === "object") {
    return {
      dailyLimit: Number(raw.dailyLimit ?? dailyCap),
      maxSingleTx: Number(raw.maxSingleTx ?? maxPerTx),
      requireApprovalAbove: Number(raw.requireApprovalAbove ?? 1_000_000),
    };
  }
  return {
    dailyLimit: Number(dailyCap),
    maxSingleTx: Number(maxPerTx),
    requireApprovalAbove: 1_000_000,
  };
}

/** KYB (developer) absolute ceilings — software on PSP; not EMI float */
function kybCeilings(kybTier: string | null | undefined): { daily: number; maxSingle: number } {
  switch ((kybTier || "sandbox").toLowerCase()) {
    case "enhanced":
      return { daily: 5_000_000, maxSingle: 500_000 };
    case "standard":
      return { daily: 500_000, maxSingle: 50_000 };
    default:
      return { daily: 10_000, maxSingle: 2_000 }; // sandbox
  }
}

/** KYC (wallet / agent controller) ceilings */
function kycCeilings(kycTier: string | null | undefined): { daily: number; maxSingle: number } {
  switch ((kycTier || "tier0").toLowerCase()) {
    case "tier2":
      return { daily: 500_000, maxSingle: 100_000 };
    case "tier1":
      return { daily: 50_000, maxSingle: 10_000 };
    default:
      return { daily: 1_000, maxSingle: 200 }; // tier0 phone-only
  }
}

function applyComplianceCeilings(
  policy: { dailyLimit: number; maxSingleTx: number; requireApprovalAbove: number },
  opts: { kybTier?: string | null; kycTier?: string | null }
) {
  const kyb = kybCeilings(opts.kybTier);
  const kyc = kycCeilings(opts.kycTier);
  const dailyLimit = Math.min(policy.dailyLimit, kyb.daily, kyc.daily);
  const maxSingleTx = Math.min(policy.maxSingleTx, kyb.maxSingle, kyc.maxSingle);
  return {
    ...policy,
    dailyLimit,
    maxSingleTx,
    requireApprovalAbove: Math.min(policy.requireApprovalAbove, maxSingleTx),
    ceilings: { kyb, kyc },
  };
}

function balanceColumnForCurrency(currency: string): string | null {
  const c = currency.toUpperCase();
  if (c === "NGN") return "balance_ngn";
  if (c === "GHS") return "balance_ghs";
  if (c === "KES") return "balance_kes";
  // Live schema column is balance_usd (not balance_usdc)
  if (c === "USDC" || c === "USD") return "balance_usd";
  if (c === "XLM") return "balance_xlm";
  return null;
}

/** Micro-units so fractional XLM/GHS compare consistently on-chain (i128). */
function toPolicyI128(n: number): bigint {
  return BigInt(Math.round(Number(n) * 1_000_000));
}

/**
 * Pre-check: always simulate `check_spend` (no sequence bump).
 * On-chain daily totals are recorded after settlement via `recordSorobanSpend`.
 * Sharing STELLAR_TREASURY_SECRET for Soroban submit + Horizon payment caused
 * tx_bad_seq / timeouts when try_spend ran before the payout.
 */
async function enforceSorobanPolicy(opts: {
  walletId: string;
  dailyLimit: number;
  maxSingleTx: number;
  amount: number;
  spentToday: number;
}): Promise<
  | { status: "skipped"; reason: string }
  | { status: "ok"; contractId: string; onChainSpent?: number }
  | { status: "denied"; contractId: string; code: number; error: string }
  | { status: "rpc_error"; contractId: string; detail: string }
> {
  const contractId = resolveSorobanPolicyContractId();
  if (!contractId.startsWith("C")) {
    return { status: "skipped", reason: "no_contract_id" };
  }

  const secret = Deno.env.get("STELLAR_TREASURY_SECRET");
  if (!secret) {
    return { status: "rpc_error", contractId, detail: "STELLAR_TREASURY_SECRET required for Soroban" };
  }

  const network = (Deno.env.get("STELLAR_NETWORK") || "testnet").toLowerCase();
  const rpcUrl =
    Deno.env.get("STELLAR_SOROBAN_RPC_URL") ||
    (network === "mainnet"
      ? "https://mainnet.sorobanrpc.com"
      : "https://soroban-testnet.stellar.org");

  try {
    let StellarSdk: any;
    try {
      StellarSdk = await import("npm:@stellar/stellar-sdk@14.2.0");
    } catch {
      StellarSdk = await import("https://esm.sh/@stellar/stellar-sdk@14.2.0");
    }
    const {
      Keypair,
      Contract,
      TransactionBuilder,
      Networks,
      rpc,
      nativeToScVal,
      BASE_FEE,
      StrKey,
    } = StellarSdk;

    if (!StrKey.isValidEd25519SecretSeed(secret)) {
      return { status: "rpc_error", contractId, detail: "invalid treasury secret" };
    }

    const kp = Keypair.fromSecret(secret);
    const server = new rpc.Server(rpcUrl, { allowHttp: false });
    const account = await server.getAccount(kp.publicKey());
    const contract = new Contract(contractId);

    const daily = toPolicyI128(opts.dailyLimit);
    const maxSingle = toPolicyI128(opts.maxSingleTx);
    const amount = toPolicyI128(opts.amount);
    // Prefer on-chain spent when readable; fall back to off-chain spentToday
    let spent = toPolicyI128(opts.spentToday);
    try {
      const utcDay = Math.floor(Date.now() / 86400000);
      const readTx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            "get_spent",
            nativeToScVal(opts.walletId, { type: "string" }),
            nativeToScVal(utcDay, { type: "u32" }),
          ),
        )
        .setTimeout(30)
        .build();
      const readSim = await server.simulateTransaction(readTx);
      if (rpc.Api.isSimulationSuccess(readSim) && readSim.result?.retval != null) {
        // Keep off-chain as max(spent) — authority until dedicated invoker account
        spent = toPolicyI128(opts.spentToday);
      }
    } catch {
      /* ignore read errors */
    }

    const policyScVal = nativeToScVal(
      { daily_limit: daily, max_single_tx: maxSingle },
      {
        type: {
          daily_limit: ["symbol", "i128"],
          max_single_tx: ["symbol", "i128"],
        },
      },
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase:
        network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "check_spend",
          policyScVal,
          nativeToScVal(amount, { type: "i128" }),
          nativeToScVal(spent, { type: "i128" }),
        ),
      )
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationSuccess(sim)) {
      return { status: "ok", contractId };
    }

    if (rpc.Api.isSimulationRestore(sim)) {
      return { status: "rpc_error", contractId, detail: "soroban restore required" };
    }

    const errMsg = JSON.stringify(sim?.error ?? sim ?? {});
    const codeMatch = errMsg.match(/Contract[,:\s]+#?(\d+)/i) ||
      errMsg.match(/"code"\s*:\s*(\d+)/);
    const code = codeMatch ? Number(codeMatch[1]) : 0;
    if (code === 1 || code === 2 || code === 3) {
      const labels: Record<number, string> = {
        1: "OverSingleTxLimit",
        2: "OverDailyLimit",
        3: "NegativeAmount",
      };
      return {
        status: "denied",
        contractId,
        code,
        error: labels[code] || `Contract#${code}`,
      };
    }

    return {
      status: "rpc_error",
      contractId,
      detail: errMsg.slice(0, 400),
    };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    // XDR/SDK skew (e.g. "Bad union switch") is not a spending-policy deny.
    if (/bad union switch/i.test(detail) && (Deno.env.get("STELLAR_SOROBAN_SOFT_FAIL") || "").trim() === "1") {
      return { status: "skipped", reason: `xdr_skew:${detail.slice(0, 80)}` };
    }
    return {
      status: "rpc_error",
      contractId,
      detail,
    };
  }
}

/** Best-effort on-chain record after settle (does not fail the payment). */
async function recordSorobanSpend(opts: {
  walletId: string;
  dailyLimit: number;
  maxSingleTx: number;
  amount: number;
}): Promise<{ ok: boolean; detail?: string }> {
  const contractId = resolveSorobanPolicyContractId();
  if (!contractId.startsWith("C")) return { ok: false, detail: "no_contract" };
  const secret = Deno.env.get("STELLAR_TREASURY_SECRET");
  if (!secret) return { ok: false, detail: "no_secret" };
  if ((Deno.env.get("STELLAR_SOROBAN_SKIP_RECORD") || "").trim() === "1") {
    return { ok: false, detail: "skip_record" };
  }

  const network = (Deno.env.get("STELLAR_NETWORK") || "testnet").toLowerCase();
  const rpcUrl =
    Deno.env.get("STELLAR_SOROBAN_RPC_URL") ||
    (network === "mainnet"
      ? "https://mainnet.sorobanrpc.com"
      : "https://soroban-testnet.stellar.org");

  try {
    let StellarSdk: any;
    try {
      StellarSdk = await import("npm:@stellar/stellar-sdk@14.2.0");
    } catch {
      StellarSdk = await import("https://esm.sh/@stellar/stellar-sdk@14.2.0");
    }
    const {
      Keypair,
      Contract,
      TransactionBuilder,
      Networks,
      rpc,
      nativeToScVal,
      BASE_FEE,
      StrKey,
    } = StellarSdk;
    if (!StrKey.isValidEd25519SecretSeed(secret)) return { ok: false, detail: "bad_secret" };

    const kp = Keypair.fromSecret(secret);
    const server = new rpc.Server(rpcUrl, { allowHttp: false });
    // Fresh account load after Horizon payment so sequence is current
    const account = await server.getAccount(kp.publicKey());
    const contract = new Contract(contractId);
    const utcDay = Math.floor(Date.now() / 86400000);
    const policyScVal = nativeToScVal(
      {
        daily_limit: toPolicyI128(opts.dailyLimit),
        max_single_tx: toPolicyI128(opts.maxSingleTx),
      },
      {
        type: {
          daily_limit: ["symbol", "i128"],
          max_single_tx: ["symbol", "i128"],
        },
      },
    );
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "try_spend",
          nativeToScVal(opts.walletId, { type: "string" }),
          policyScVal,
          nativeToScVal(toPolicyI128(opts.amount), { type: "i128" }),
          nativeToScVal(utcDay, { type: "u32" }),
        ),
      )
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(sim)) {
      return { ok: false, detail: "simulate_failed" };
    }
    const prepared = await server.prepareTransaction(tx, sim);
    prepared.sign(kp);
    const sent = await server.sendTransaction(prepared);
    return {
      ok: sent.status === "PENDING" || sent.status === "DUPLICATE" || sent.status === "SUCCESS",
      detail: sent.hash || sent.status,
    };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

// ── Main Handler ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authenticate via API key
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey.length > 100) {
      return new Response(JSON.stringify({ error: "Missing or invalid X-API-KEY header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use separate .eq() calls to prevent SQL injection via .or() interpolation
    let developer: {
      id: string;
      kyb_tier?: string | null;
      kyb_status?: string | null;
    } | null = null;
    let isLiveKey = false;
    const { data: devByLive } = await supabase
      .from("developers")
      .select("id, kyb_tier, kyb_status")
      .eq("live_api_key", apiKey)
      .maybeSingle();
    if (devByLive) {
      developer = devByLive;
      isLiveKey = true;
    } else {
      const { data: devByTest } = await supabase
        .from("developers")
        .select("id, kyb_tier, kyb_status")
        .eq("test_api_key", apiKey)
        .maybeSingle();
      developer = devByTest;
    }

    if (!developer) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isLiveKey && (developer.kyb_status || "none") !== "approved") {
      return new Response(
        JSON.stringify({
          error: "Live API keys require approved KYB",
          kyb_status: developer.kyb_status ?? "none",
          hint: "Use test API key for sandbox, or complete KYB for live",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if ((developer.kyb_status || "") === "rejected") {
      return new Response(JSON.stringify({ error: "Developer KYB rejected" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit check
    const rl = checkRateLimit(apiKey);
    const RATE_WARN_THRESHOLD = 0.8;
    const usagePercent = ((RATE_LIMIT - rl.remaining) / RATE_LIMIT) * 100;
    const isNearLimit = rl.remaining <= Math.floor(RATE_LIMIT * (1 - RATE_WARN_THRESHOLD));
    const rlHeaders: Record<string, string> = {
      "X-RateLimit-Limit": String(RATE_LIMIT),
      "X-RateLimit-Remaining": String(rl.remaining),
      "X-RateLimit-Reset": String(rl.reset),
    };
    if (isNearLimit && rl.allowed) {
      rlHeaders["X-RateLimit-Warning"] = `Usage at ${usagePercent.toFixed(0)}% (${rl.remaining} requests remaining)`;
      console.warn(`[RATE-LIMIT-WARNING] Developer ${developer.id} at ${usagePercent.toFixed(0)}% usage (${rl.remaining} remaining)`);

      // Log rate limit warning for dashboard visibility
      try {
        await supabase.from("api_call_logs").insert({
          developer_id: developer.id,
          endpoint: "/pay (rate-limit-warning)",
          method: "SYSTEM",
          status_code: 0,
        });
      } catch (_) { /* non-blocking */ }
    }
    if (!rl.allowed) {
      console.warn(`[RATE-LIMIT-EXCEEDED] Developer ${developer.id} exceeded rate limit`);
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Try again in ${rl.retryAfter} seconds.`, retryAfter: rl.retryAfter }),
        { status: 429, headers: { ...corsHeaders, ...rlHeaders, "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } }
      );
    }

    // Idempotency-Key (optional) — replay stored response to prevent double-spend
    const idempotencyKey = (req.headers.get("Idempotency-Key") || "").trim().slice(0, 128);
    const saveIdempotent = async (status: number, body: Record<string, unknown>) => {
      if (!idempotencyKey) return;
      await supabase
        .from("pay_idempotency")
        .update({ response_status: status, response_body: body })
        .eq("developer_id", developer!.id)
        .eq("idempotency_key", idempotencyKey);
    };
    if (idempotencyKey) {
      const { data: existing } = await supabase
        .from("pay_idempotency")
        .select("response_status, response_body")
        .eq("developer_id", developer.id)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (existing?.response_body && existing.response_status) {
        return new Response(JSON.stringify(existing.response_body), {
          status: existing.response_status,
          headers: {
            ...corsHeaders,
            ...rlHeaders,
            "Content-Type": "application/json",
            "Idempotency-Replayed": "true",
          },
        });
      }
      const { error: idempInsertErr } = await supabase.from("pay_idempotency").insert({
        developer_id: developer.id,
        idempotency_key: idempotencyKey,
        response_status: null,
        response_body: null,
      });
      if (idempInsertErr) {
        const { data: raced } = await supabase
          .from("pay_idempotency")
          .select("response_status, response_body")
          .eq("developer_id", developer.id)
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();
        if (raced?.response_body && raced.response_status) {
          return new Response(JSON.stringify(raced.response_body), {
            status: raced.response_status,
            headers: {
              ...corsHeaders,
              ...rlHeaders,
              "Content-Type": "application/json",
              "Idempotency-Replayed": "true",
            },
          });
        }
        return new Response(
          JSON.stringify({ error: "Idempotent request already in progress", retryAfter: 2 }),
          { status: 409, headers: { ...corsHeaders, ...rlHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const body = await req.json();
    const { walletId, to, amount, currency, method, note, bankCode, preferRail } = body;

    if (!walletId || !to || !amount || !currency || !method) {
      return new Response(
        JSON.stringify({ error: "walletId, to, amount, currency, method are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof amount !== "number" || amount <= 0 || amount > 10_000_000) {
      return new Response(
        JSON.stringify({ error: "amount must be a positive number up to 10,000,000" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const VALID_METHODS = ["mobile_money", "bank_transfer", "crypto", "card"];
    if (!VALID_METHODS.includes(method)) {
      return new Response(
        JSON.stringify({ error: `method must be one of: ${VALID_METHODS.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof to !== "string" || to.length < 3 || to.length > 100) {
      return new Response(
        JSON.stringify({ error: "to must be a string between 3-100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof currency !== "string" || !/^(NGN|GHS|KES|ZAR|USD|XLM|USDC)$/.test(currency)) {
      return new Response(
        JSON.stringify({
          error: "currency must be one of: NGN, GHS, KES, ZAR, USD, XLM, USDC",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch wallet and verify ownership
    const { data: wallet } = await supabase
      .from("agent_wallets")
      .select("*")
      .eq("id", walletId)
      .eq("owner_id", developer.id)
      .single();

    if (!wallet) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (wallet.status !== "active") {
      return new Response(JSON.stringify({ error: "Wallet is not active" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((wallet.kyc_status || "") === "rejected") {
      return new Response(JSON.stringify({ error: "Wallet KYC rejected" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce spending policy + KYC/KYB ceilings
    const basePolicy = resolveSpendingPolicy(wallet as Record<string, unknown>);
    const policy = applyComplianceCeilings(basePolicy, {
      kybTier: isLiveKey ? developer.kyb_tier : "sandbox",
      kycTier: wallet.kyc_tier,
    });

    if (amount > policy.maxSingleTx) {
      return new Response(
        JSON.stringify({
          error: "Exceeds single transaction limit",
          limit: policy.maxSingleTx,
          kyc_tier: wallet.kyc_tier ?? "tier0",
          kyb_tier: isLiveKey ? developer.kyb_tier : "sandbox",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amount > policy.requireApprovalAbove) {
      return new Response(
        JSON.stringify({ error: "Requires manual approval", requiresApproval: true }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check daily spend
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { data: todayTxns } = await supabase
      .from("transactions")
      .select("amount")
      .eq("agent_wallet_id", walletId)
      .gte("created_at", todayStart.toISOString());

    const spentToday = todayTxns?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

    if (spentToday + amount > policy.dailyLimit) {
      return new Response(
        JSON.stringify({
          error: "Exceeds daily limit",
          dailyLimit: policy.dailyLimit,
          spentToday,
          requested: amount,
          kyc_tier: wallet.kyc_tier ?? "tier0",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // On-chain attestation (Soroban) — same caps, fail-closed when contract configured
    const soroban = await enforceSorobanPolicy({
      walletId,
      dailyLimit: policy.dailyLimit,
      maxSingleTx: policy.maxSingleTx,
      amount,
      spentToday,
    });
    if (soroban.status === "denied") {
      return new Response(
        JSON.stringify({
          error: "Soroban spending policy denied",
          code: soroban.code,
          detail: soroban.error,
          sorobanPolicyContractId: soroban.contractId,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (soroban.status === "rpc_error") {
      const soft = (Deno.env.get("STELLAR_SOROBAN_SOFT_FAIL") || "").trim() === "1";
      if (!soft) {
        return new Response(
          JSON.stringify({
            error: "Soroban policy check unavailable",
            detail: soroban.detail,
            sorobanPolicyContractId: soroban.contractId,
            hint: "Set STELLAR_SOROBAN_SOFT_FAIL=1 only for emergency off-chain-only",
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      console.warn("Soroban soft-fail:", soroban.detail);
    }

    // Balance check (ledger) before routing
    const balCol = balanceColumnForCurrency(currency);
    if (balCol) {
      const available = Number(wallet[balCol] ?? 0);
      if (available < amount) {
        return new Response(
          JSON.stringify({
            error: "Insufficient balance",
            currency,
            available,
            requested: amount,
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Route through multi-rail payment router ──
    const rail = await routePayment({
      method,
      country: wallet.country,
      currency,
      amount,
      to,
      note,
      bankCode: typeof bankCode === "string" ? bankCode : undefined,
      // preferRail only on test keys (failover drills / sandbox)
      preferRail: !isLiveKey && typeof preferRail === "string" ? preferRail : undefined,
    });

    if (rail.status === "failed") {
      return new Response(
        JSON.stringify({
          error: "Payment rail failed",
          provider: rail.provider,
          txId: rail.railTxId,
          detail: rail.errorDetail ?? null,
          hint:
            rail.provider.startsWith("stellar")
              ? "Configure Stellar Horizon settlement (STELLAR_TREASURY_SECRET) or use fiat methods"
              : "Check Paystack/Flutterwave credentials, recipient details, and Paystack balance top-up",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: txRow, error: txError } = await supabase
      .from("transactions")
      .insert({
        agent_wallet_id: walletId,
        type: "send",
        recipient: to,
        amount,
        currency,
        method,
        note: note ?? null,
        rail_tx_id: rail.railTxId,
        status: rail.status,
        fee: rail.fee,
        provider: rail.provider,
        stellar_tx_hash: rail.stellarTxHash ?? null,
      })
      .select("id")
      .single();

    if (txError || !txRow) {
      return new Response(JSON.stringify({ error: txError?.message ?? "Transaction insert failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Debit ledger (schema has balance_* only — no total_volume/total_txns)
    if (balCol) {
      const { error: debitError } = await supabase
        .from("agent_wallets")
        .update({ [balCol]: Number(wallet[balCol] ?? 0) - amount })
        .eq("id", walletId);
      if (debitError) {
        console.error("Ledger debit failed after rail success:", debitError);
        const failBody = {
          error: "Payment sent but ledger debit failed — reconcile manually",
          txId: rail.railTxId,
          transactionId: txRow.id,
          provider: rail.provider,
          detail: debitError.message,
          reconcile: "POST /functions/v1/reconcile-ledger",
        };
        await saveIdempotent(500, failBody);
        return new Response(JSON.stringify(failBody), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase
        .from("transactions")
        .update({ ledger_debited_at: new Date().toISOString() })
        .eq("id", txRow.id);
    }

    // ── Fire webhook delivery (async, non-blocking) ──
    const eventType =
      rail.status === "settled"
        ? "transaction.settled"
        : rail.status === "pending"
          ? "transaction.pending"
          : "transaction.failed";
    try {
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhook-deliver`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            developerId: developer.id,
            eventType,
            payload: {
              txId: rail.railTxId,
              walletId,
              amount,
              currency,
              method,
              recipient: to,
              status: rail.status,
              fee: rail.fee,
              provider: rail.provider,
              stellarTxHash: rail.stellarTxHash ?? null,
              timestamp: new Date().toISOString(),
            },
          }),
        }
      );
    } catch (whErr) {
      console.error("Webhook fire failed (non-blocking):", whErr);
    }

    let onChainRecord: { ok: boolean; detail?: string } | null = null;
    if (soroban.status === "ok" && rail.status === "settled") {
      onChainRecord = await recordSorobanSpend({
        walletId,
        dailyLimit: policy.dailyLimit,
        maxSingleTx: policy.maxSingleTx,
        amount,
      });
      if (!onChainRecord.ok) {
        console.warn("Soroban try_spend record (non-blocking):", onChainRecord.detail);
      }
    }

    const successBody = {
      txId: rail.railTxId,
      status: rail.status,
      provider: rail.provider,
      settledAt: rail.status === "settled" ? new Date().toISOString() : null,
      fee: `${rail.fee.toFixed(2)} ${currency}`,
      amount,
      currency,
      method,
      recipient: to,
      stellarTxHash: rail.stellarTxHash ?? null,
      policyEnforcement:
        soroban.status === "ok"
          ? onChainRecord?.ok
            ? "soroban-recorded+off-chain"
            : "soroban+off-chain"
          : soroban.status === "skipped"
            ? "off-chain"
            : "off-chain-soft-fail",
      sorobanPolicyContractId:
        soroban.status === "skipped" ? null : soroban.contractId,
    };
    await saveIdempotent(200, successBody);

    return new Response(JSON.stringify(successBody), {
      status: 200,
      headers: { ...corsHeaders, ...rlHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
