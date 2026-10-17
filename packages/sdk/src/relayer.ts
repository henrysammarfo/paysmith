/**
 * OpenZeppelin Relayer / Channels scaffold for Paysmith treasury sequencing.
 *
 * Production wire-up (Instaward Week 2): point `relayerUrl` at a hosted OZ Relayer
 * and submit fee-bumped ops so shared Stellar secret sequence races stop.
 * Docs: https://docs.openzeppelin.com/relayer
 */

export type RelayerSubmitRequest = {
  network: "testnet" | "mainnet";
  /** Base64 XDR of the inner transaction (unsigned or signed by source) */
  xdr: string;
  /** Optional fee-bump source / sponsor hint for Channels */
  feeBumpHint?: string;
  idempotencyKey: string;
};

export type RelayerSubmitResult = {
  status: "queued" | "submitted" | "scaffold";
  hash?: string;
  sequence?: string;
  note?: string;
};

export type OpenZeppelinRelayerClientOptions = {
  /** e.g. https://relayer.example.com */
  baseUrl?: string;
  /** Bearer / API key for Relayer auth */
  apiKey?: string;
  fetchImpl?: typeof fetch;
};

/**
 * Minimal client. Without baseUrl+apiKey returns scaffold responses (no network).
 * Does not invent mainnet claims — callers must pass network explicitly.
 */
export class OpenZeppelinRelayerClient {
  private readonly baseUrl?: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: OpenZeppelinRelayerClientOptions = {}) {
    this.baseUrl = opts.baseUrl?.replace(/\/$/, "");
    this.apiKey = opts.apiKey;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  get ready(): boolean {
    return Boolean(this.baseUrl && this.apiKey);
  }

  async submit(req: RelayerSubmitRequest): Promise<RelayerSubmitResult> {
    if (!this.ready || !this.baseUrl) {
      return {
        status: "scaffold",
        note:
          "Set PAYSMITH_OZ_RELAYER_URL + PAYSMITH_OZ_RELAYER_API_KEY to enable fee-bump submit",
      };
    }

    const res = await this.fetchImpl(`${this.baseUrl}/api/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "Idempotency-Key": req.idempotencyKey,
      },
      body: JSON.stringify({
        network: req.network,
        xdr: req.xdr,
        fee_bump_hint: req.feeBumpHint,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      hash?: string;
      sequence?: string;
      status?: string;
      error?: string;
    };

    if (!res.ok) {
      return {
        status: "scaffold",
        note: body.error || `Relayer HTTP ${res.status}`,
      };
    }

    return {
      status: body.status === "queued" ? "queued" : "submitted",
      hash: body.hash,
      sequence: body.sequence,
    };
  }
}

/** Env-driven factory for agent apps / CLI */
export function createRelayerFromEnv(
  env: Record<string, string | undefined> = typeof process !== "undefined"
    ? process.env
    : {},
): OpenZeppelinRelayerClient {
  return new OpenZeppelinRelayerClient({
    baseUrl: env.PAYSMITH_OZ_RELAYER_URL || env.OZ_RELAYER_URL,
    apiKey: env.PAYSMITH_OZ_RELAYER_API_KEY || env.OZ_RELAYER_API_KEY,
  });
}
