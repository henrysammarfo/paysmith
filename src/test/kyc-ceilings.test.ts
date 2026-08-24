import { describe, it, expect } from "vitest";

function kybCeilings(kybTier: string | null | undefined) {
  switch ((kybTier || "sandbox").toLowerCase()) {
    case "enhanced":
      return { daily: 5_000_000, maxSingle: 500_000 };
    case "standard":
      return { daily: 500_000, maxSingle: 50_000 };
    default:
      return { daily: 10_000, maxSingle: 2_000 };
  }
}

function kycCeilings(kycTier: string | null | undefined) {
  switch ((kycTier || "tier0").toLowerCase()) {
    case "tier2":
      return { daily: 500_000, maxSingle: 100_000 };
    case "tier1":
      return { daily: 50_000, maxSingle: 10_000 };
    default:
      return { daily: 1_000, maxSingle: 200 };
  }
}

function applyComplianceCeilings(
  policy: { dailyLimit: number; maxSingleTx: number },
  opts: { kybTier?: string | null; kycTier?: string | null },
) {
  const kyb = kybCeilings(opts.kybTier);
  const kyc = kycCeilings(opts.kycTier);
  return {
    dailyLimit: Math.min(policy.dailyLimit, kyb.daily, kyc.daily),
    maxSingleTx: Math.min(policy.maxSingleTx, kyb.maxSingle, kyc.maxSingle),
  };
}

describe("KYC/KYB ceilings", () => {
  it("clamps sandbox + tier0 below wallet policy", () => {
    const p = applyComplianceCeilings(
      { dailyLimit: 100_000, maxSingleTx: 50_000 },
      { kybTier: "sandbox", kycTier: "tier0" },
    );
    expect(p.dailyLimit).toBe(1_000);
    expect(p.maxSingleTx).toBe(200);
  });

  it("allows higher limits at tier2 + standard KYB", () => {
    const p = applyComplianceCeilings(
      { dailyLimit: 1_000_000, maxSingleTx: 200_000 },
      { kybTier: "standard", kycTier: "tier2" },
    );
    // min(policy, kyb.standard, kyc.tier2) → daily 500k, maxSingle 50k (KYB binds)
    expect(p.dailyLimit).toBe(500_000);
    expect(p.maxSingleTx).toBe(50_000);
  });

  it("blocks over-limit at tier0", () => {
    const p = applyComplianceCeilings(
      { dailyLimit: 10_000, maxSingleTx: 2_000 },
      { kybTier: "sandbox", kycTier: "tier0" },
    );
    expect(500 > p.maxSingleTx).toBe(true);
    expect(100 > p.maxSingleTx).toBe(false);
  });
});
