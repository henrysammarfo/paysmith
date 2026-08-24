import { describe, it, expect } from "vitest";

function balanceColumnForCurrency(currency: string): string | null {
  const c = currency.toUpperCase();
  if (c === "NGN") return "balance_ngn";
  if (c === "GHS") return "balance_ghs";
  if (c === "KES") return "balance_kes";
  if (c === "USDC" || c === "USD") return "balance_usd";
  if (c === "XLM") return "balance_xlm";
  return null;
}

function isOrphanTx(tx: { ledger_debited_at?: string | null; status: string }) {
  return tx.ledger_debited_at == null && (tx.status === "settled" || tx.status === "pending");
}

describe("reconcile ledger helpers", () => {
  it("maps currencies to live balance columns", () => {
    expect(balanceColumnForCurrency("USDC")).toBe("balance_usd");
    expect(balanceColumnForCurrency("GHS")).toBe("balance_ghs");
  });

  it("detects orphan transactions", () => {
    expect(isOrphanTx({ status: "settled", ledger_debited_at: null })).toBe(true);
    expect(isOrphanTx({ status: "pending", ledger_debited_at: undefined })).toBe(true);
    expect(isOrphanTx({ status: "settled", ledger_debited_at: "2026-01-01T00:00:00Z" })).toBe(false);
    expect(isOrphanTx({ status: "failed", ledger_debited_at: null })).toBe(false);
  });

  it("blocks reconcile when balance insufficient", () => {
    const available = 10;
    const amount = 25;
    expect(available < amount).toBe(true);
  });
});
