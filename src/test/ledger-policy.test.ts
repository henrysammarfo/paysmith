import { describe, it, expect } from "vitest";

/** Mirrors supabase/functions/pay balanceColumnForCurrency */
function balanceColumnForCurrency(currency: string): string | null {
  const c = currency.toUpperCase();
  if (c === "NGN") return "balance_ngn";
  if (c === "GHS") return "balance_ghs";
  if (c === "KES") return "balance_kes";
  if (c === "USDC" || c === "USD") return "balance_usd";
  if (c === "XLM") return "balance_xlm";
  return null;
}

function resolveSpendingPolicy(wallet: Record<string, unknown>) {
  const dailyCap = wallet.daily_cap ?? wallet.daily_limit ?? 10000;
  const maxPerTx = wallet.max_per_tx ?? wallet.max_single_tx ?? 2000;
  return {
    dailyLimit: Number(dailyCap),
    maxSingleTx: Number(maxPerTx),
    requireApprovalAbove: 1_000_000,
  };
}

describe("ledger currency map", () => {
  it("maps GHS and XLM", () => {
    expect(balanceColumnForCurrency("GHS")).toBe("balance_ghs");
    expect(balanceColumnForCurrency("xlm")).toBe("balance_xlm");
    expect(balanceColumnForCurrency("USDC")).toBe("balance_usd");
  });
});

describe("spending policy legacy columns", () => {
  it("uses daily_cap / max_per_tx", () => {
    const p = resolveSpendingPolicy({ daily_cap: 500, max_per_tx: 50 });
    expect(p.dailyLimit).toBe(500);
    expect(p.maxSingleTx).toBe(50);
    expect(1 > p.maxSingleTx).toBe(false);
    expect(100 > p.maxSingleTx).toBe(true);
  });
});
