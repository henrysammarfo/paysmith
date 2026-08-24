/** Payment methods accepted by /agents-create and /pay */
export type PaymentMethod = "mobile_money" | "bank_transfer" | "crypto" | "card";

export type SpendingPolicy = {
  dailyLimit?: number;
  maxSingleTx?: number;
  requireApprovalAbove?: number;
};

export type CreateAgentInput = {
  name: string;
  /** ISO-3166 alpha-2, e.g. GH, NG */
  country: string;
  /** e.g. GHS, NGN, USDC, XLM */
  currency: string;
  paymentMethods?: PaymentMethod[];
  spendingPolicy?: SpendingPolicy;
};

export type AgentWallet = {
  walletId: string;
  status: string;
  name: string;
  country: string;
  currency: string;
  paymentMethods: PaymentMethod[] | string[];
  spendingPolicy: Required<Pick<SpendingPolicy, "dailyLimit" | "maxSingleTx">> & {
    requireApprovalAbove?: number;
  };
  kycTier?: string | number | null;
  kycStatus?: string | null;
  createdAt?: string;
};

export type WalletBalances = {
  ghs: number;
  ngn: number;
  usd: number;
  usdc: number;
  kes: number;
  xlm: number;
};

export type WalletBalance = AgentWallet & {
  balances: WalletBalances;
};

export type WalletList = {
  wallets: WalletBalance[];
  count: number;
};

export type PayInput = {
  walletId: string;
  /** MoMo MSISDN, bank account, or Stellar address */
  to: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  note?: string;
  /** Telco/bank code — e.g. MTN for MoMo */
  bankCode?: string;
  preferRail?: string;
};

export type PayResult = {
  txId: string;
  status: "settled" | "pending" | "failed" | string;
  provider: string;
  settledAt?: string | null;
  fee?: string;
  amount: number;
  currency: string;
  method?: string;
  recipient?: string;
  stellarTxHash?: string | null;
  policyEnforcement?: string;
  sorobanPolicyContractId?: string | null;
};

export type PartnaQuoteParams = {
  fromCurrency?: string;
  toCurrency?: string;
  fromAmount?: string | number;
};

export type PaysmithClientOptions = {
  /** Edge base ending at /functions/v1 */
  baseUrl?: string;
  /** Developer API key (test or live) */
  apiKey: string;
  fetch?: typeof fetch;
  /** Retry once on HTTP 429 (default true) */
  retryOnRateLimit?: boolean;
};

/** Default Paysmith Edge base (sandbox / testnet project). */
export const DEFAULT_BASE_URL =
  "https://hkngxtrqhnkzkbqgqbjk.supabase.co/functions/v1";
