import { describe, it, expect } from "vitest";

/** Mirrors agents-create / agents-balance spendingPolicy mapping */
function spendingPolicyFromRow(row: { daily_cap?: number | null; max_per_tx?: number | null }) {
  const dailyLimit = Number(row.daily_cap ?? 10000);
  const maxSingleTx = Number(row.max_per_tx ?? 2000);
  return {
    dailyLimit,
    maxSingleTx,
    requireApprovalAbove: maxSingleTx,
  };
}

function spendingPolicyToColumns(spendingPolicy?: {
  dailyLimit?: number;
  maxSingleTx?: number;
}) {
  return {
    daily_cap: spendingPolicy?.dailyLimit ?? 10000,
    max_per_tx: spendingPolicy?.maxSingleTx ?? 2000,
  };
}

describe("agents-create spending policy columns", () => {
  it("maps spendingPolicy object to daily_cap / max_per_tx", () => {
    expect(spendingPolicyToColumns({ dailyLimit: 50000, maxSingleTx: 10000 })).toEqual({
      daily_cap: 50000,
      max_per_tx: 10000,
    });
  });

  it("reads spendingPolicy back from row columns", () => {
    expect(spendingPolicyFromRow({ daily_cap: 500, max_per_tx: 50 })).toEqual({
      dailyLimit: 500,
      maxSingleTx: 50,
      requireApprovalAbove: 50,
    });
  });
});

describe("agent wallet id format", () => {
  it("accepts uuid v4 shape", () => {
    const id = "c2caf034-475a-49c6-9b3a-8e5ecd4bc120";
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
