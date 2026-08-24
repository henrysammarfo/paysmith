import { PaysmithError } from "./errors.js";
import {
  DEFAULT_BASE_URL,
  type AgentWallet,
  type CreateAgentInput,
  type PartnaQuoteParams,
  type PayInput,
  type PayResult,
  type PaysmithClientOptions,
  type WalletBalance,
  type WalletList,
} from "./types.js";

type RequestInitExtra = RequestInit & {
  idempotencyKey?: string;
};

export class Paysmith {
  private baseUrl: string;
  private apiKey: string;
  private fetchFn: typeof fetch;
  private retryOnRateLimit: boolean;

  constructor(opts: PaysmithClientOptions) {
    if (!opts.apiKey?.trim()) {
      throw new Error("Paysmith: apiKey is required");
    }
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.apiKey = opts.apiKey.trim();
    this.fetchFn = opts.fetch ?? fetch;
    this.retryOnRateLimit = opts.retryOnRateLimit ?? true;
  }

  private async request<T>(path: string, init: RequestInitExtra = {}): Promise<T> {
    const run = async (): Promise<{ res: Response; body: unknown }> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": this.apiKey,
        ...(init.headers as Record<string, string> | undefined),
      };
      if (init.idempotencyKey) {
        headers["Idempotency-Key"] = init.idempotencyKey;
      }

      const { idempotencyKey: _ik, ...fetchInit } = init;
      const res = await this.fetchFn(`${this.baseUrl}${path}`, {
        ...fetchInit,
        headers,
      });
      const text = await res.text();
      let body: unknown = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }
      return { res, body };
    };

    let { res, body } = await run();

    if (res.status === 429 && this.retryOnRateLimit) {
      const retryAfterHeader = res.headers.get("Retry-After");
      const fromBody =
        typeof body === "object" && body && "retryAfter" in body
          ? Number((body as { retryAfter: unknown }).retryAfter)
          : NaN;
      const seconds = Number(retryAfterHeader) || fromBody || 1;
      await sleep(Math.min(Math.max(seconds, 1), 60) * 1000);
      ({ res, body } = await run());
    }

    if (!res.ok) {
      const msg =
        typeof body === "object" && body && "error" in body
          ? String((body as { error: unknown }).error)
          : `HTTP ${res.status}`;
      const retryAfter =
        typeof body === "object" && body && "retryAfter" in body
          ? Number((body as { retryAfter: unknown }).retryAfter)
          : undefined;
      throw new PaysmithError(msg, res.status, body, retryAfter);
    }

    return body as T;
  }

  /** POST /agents-create — provision a policy-bound agent wallet */
  createAgent(input: CreateAgentInput): Promise<AgentWallet> {
    return this.request<AgentWallet>("/agents-create", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  /** GET /agents-balance?walletId= — single wallet + balances */
  getBalance(walletId: string): Promise<WalletBalance> {
    if (!walletId) throw new Error("Paysmith.getBalance: walletId is required");
    return this.request<WalletBalance>(
      `/agents-balance?walletId=${encodeURIComponent(walletId)}`,
      { method: "GET" },
    );
  }

  /** GET /agents-balance — list all wallets for this API key */
  listWallets(): Promise<WalletList> {
    return this.request<WalletList>("/agents-balance", { method: "GET" });
  }

  /**
   * POST /pay — MoMo / bank / Stellar.
   * Always pass opts.idempotencyKey (or {@link newIdempotencyKey}).
   */
  pay(input: PayInput, opts?: { idempotencyKey?: string }): Promise<PayResult> {
    return this.request<PayResult>("/pay", {
      method: "POST",
      body: JSON.stringify(input),
      idempotencyKey: opts?.idempotencyKey,
    });
  }

  /**
   * GET /partna-quote — FX quote when Partna is configured (may 501).
   * Stellar USDC payouts do not go through Partna.
   */
  quotePartna(params: PartnaQuoteParams = {}): Promise<unknown> {
    const q = new URLSearchParams();
    if (params.fromCurrency) q.set("fromCurrency", params.fromCurrency);
    if (params.toCurrency) q.set("toCurrency", params.toCurrency);
    if (params.fromAmount != null) q.set("fromAmount", String(params.fromAmount));
    const qs = q.toString();
    return this.request<unknown>(`/partna-quote${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
