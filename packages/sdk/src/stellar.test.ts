import { describe, expect, it } from "vitest";
import {
  getStellarConfig,
  smartAccountKitScaffold,
  stellarLabContractUrl,
  PAYSMITH_SOROBAN_POLICY_TESTNET,
} from "./stellar.js";

describe("stellar helpers", () => {
  it("defaults to testnet policy contract", () => {
    const cfg = getStellarConfig();
    expect(cfg.network).toBe("testnet");
    expect(cfg.policyContractId).toBe(PAYSMITH_SOROBAN_POLICY_TESTNET);
  });

  it("builds Lab explorer URL", () => {
    const url = stellarLabContractUrl("CABC");
    expect(url).toContain("lab.stellar.org");
    expect(url).toContain("CABC");
  });

  it("smart account scaffold until wasm hash set", () => {
    expect(smartAccountKitScaffold().status).toBe("scaffold");
    expect(
      smartAccountKitScaffold({
        accountWasmHash: "aa",
        webauthnVerifierAddress: "CXYZ",
      }).status,
    ).toBe("ready");
  });
});
