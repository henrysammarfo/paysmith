/**
 * Stellar helpers for agent apps (testnet-first).
 * Smart Account Kit / Freighter adapters — optional peer deps at runtime.
 */

export const PAYSMITH_SOROBAN_POLICY_TESTNET =
  "CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW";

export const STELLAR_TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
export const STELLAR_TESTNET_HORIZON = "https://horizon-testnet.stellar.org";
export const STELLAR_TESTNET_RPC = "https://soroban-testnet.stellar.org";

export type StellarNetworkConfig = {
  network: "testnet" | "mainnet";
  horizonUrl: string;
  rpcUrl: string;
  passphrase: string;
  policyContractId: string;
};

export function getStellarConfig(
  network: "testnet" | "mainnet" = "testnet",
  policyContractId = PAYSMITH_SOROBAN_POLICY_TESTNET,
): StellarNetworkConfig {
  if (network === "mainnet") {
    return {
      network,
      horizonUrl: "https://horizon.stellar.org",
      rpcUrl: "https://mainnet.sorobanrpc.com",
      passphrase: "Public Global Stellar Network ; September 2015",
      policyContractId,
    };
  }
  return {
    network: "testnet",
    horizonUrl: STELLAR_TESTNET_HORIZON,
    rpcUrl: STELLAR_TESTNET_RPC,
    passphrase: STELLAR_TESTNET_PASSPHRASE,
    policyContractId,
  };
}

/** Lab deep-link for judges */
export function stellarLabContractUrl(contractId: string, network = "testnet") {
  return `https://lab.stellar.org/smart-contracts/contract-explorer?network=${network}&contractId=${contractId}`;
}

/**
 * Smart Account Kit integration notes (runtime optional).
 * Install when ready: `npm i @stellar/smart-account-kit` (see stellar/smart-account-kit).
 * Paysmith uses this for *operator* auth roadmap; agent spend still goes through /pay + Soroban policy.
 */
export type SmartAccountRoadmapConfig = {
  rpcUrl: string;
  networkPassphrase: string;
  /** OpenZeppelin account wasm hash after deploy */
  accountWasmHash?: string;
  webauthnVerifierAddress?: string;
  /** OpenZeppelin Relayer / Channels proxy */
  relayerUrl?: string;
};

export function smartAccountKitScaffold(
  cfg: Partial<SmartAccountRoadmapConfig> = {},
): SmartAccountRoadmapConfig & { status: "scaffold" | "ready" } {
  const base = getStellarConfig("testnet");
  const merged: SmartAccountRoadmapConfig = {
    rpcUrl: cfg.rpcUrl ?? base.rpcUrl,
    networkPassphrase: cfg.networkPassphrase ?? base.passphrase,
    accountWasmHash: cfg.accountWasmHash,
    webauthnVerifierAddress: cfg.webauthnVerifierAddress,
    relayerUrl: cfg.relayerUrl,
  };
  const ready = Boolean(
    merged.accountWasmHash && merged.webauthnVerifierAddress,
  );
  return { ...merged, status: ready ? "ready" : "scaffold" };
}
