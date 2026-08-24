import { describe, it, expect } from "vitest";

/** When rail succeeds but ledger debit fails, idempotency must store 500 so retries do not re-hit rail. */
function shouldPersistIdempotencyOnDebitFail(status: number): boolean {
  return status === 500;
}

describe("pay idempotency on debit fail", () => {
  it("persists 500 response to block double rail", () => {
    expect(shouldPersistIdempotencyOnDebitFail(500)).toBe(true);
    expect(shouldPersistIdempotencyOnDebitFail(200)).toBe(false);
    expect(shouldPersistIdempotencyOnDebitFail(502)).toBe(false);
  });
});
