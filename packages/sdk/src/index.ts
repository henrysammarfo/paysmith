/**
 * @paysmithhq/sdk — TypeScript client for Paysmith Edge API (sandbox / testnet).
 *
 * Maps 1:1 to Edge functions:
 * - POST /agents-create
 * - GET  /agents-balance
 * - POST /pay
 * - GET  /partna-quote (optional; may 501)
 */

export { Paysmith } from "./client.js";
export { PaysmithError } from "./errors.js";
export { newIdempotencyKey } from "./idempotency.js";
export {
  DEFAULT_BASE_URL,
  type AgentWallet,
  type CreateAgentInput,
  type PartnaQuoteParams,
  type PayInput,
  type PayResult,
  type PaymentMethod,
  type PaysmithClientOptions,
  type SpendingPolicy,
  type WalletBalance,
  type WalletBalances,
  type WalletList,
} from "./types.js";

export { Paysmith as default } from "./client.js";
export {
  PAYSMITH_SOROBAN_POLICY_TESTNET,
  STELLAR_TESTNET_HORIZON,
  STELLAR_TESTNET_RPC,
  getStellarConfig,
  stellarLabContractUrl,
  smartAccountKitScaffold,
  type StellarNetworkConfig,
  type SmartAccountRoadmapConfig,
} from "./stellar.js";
export {
  OpenZeppelinRelayerClient,
  createRelayerFromEnv,
  type RelayerSubmitRequest,
  type RelayerSubmitResult,
  type OpenZeppelinRelayerClientOptions,
} from "./relayer.js";
