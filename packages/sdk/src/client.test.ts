import { describe, expect, it, vi } from "vitest";
import {
  Paysmith,
  PaysmithError,
  newIdempotencyKey,
  DEFAULT_BASE_URL,
} from "./index.js";

describe("Paysmith SDK", () => {
  it("requires apiKey", () => {
    expect(() => new Paysmith({ apiKey: "" })).toThrow(/apiKey/);
  });

  it("uses DEFAULT_BASE_URL and x-api-key", async () => {
    const fetchFn = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            walletId: "w1",
            status: "active",
            name: "a",
            country: "GH",
            currency: "GHS",
            paymentMethods: [],
            spendingPolicy: { dailyLimit: 1, maxSingleTx: 1 },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        ),
    );
    const ps = new Paysmith({
      apiKey: "ps_test_x",
      fetch: fetchFn as unknown as typeof fetch,
    });
    await ps.createAgent({ name: "bot", country: "GH", currency: "GHS" });
    expect(fetchFn.mock.calls[0][0]).toBe(`${DEFAULT_BASE_URL}/agents-create`);
    expect(fetchFn.mock.calls[0][1].headers["x-api-key"]).toBe("ps_test_x");
  });

  it("sends Idempotency-Key on pay", async () => {
    const fetchFn = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            txId: "t1",
            status: "settled",
            provider: "sandbox",
            amount: 1,
            currency: "GHS",
          }),
          { status: 200 },
        ),
    );
    const ps = new Paysmith({
      apiKey: "ps_test_x",
      fetch: fetchFn as unknown as typeof fetch,
    });
    await ps.pay(
      {
        walletId: "w",
        to: "055",
        amount: 1,
        currency: "GHS",
        method: "mobile_money",
      },
      { idempotencyKey: "order_1" },
    );
    expect(fetchFn.mock.calls[0][1].headers["Idempotency-Key"]).toBe("order_1");
  });

  it("throws PaysmithError on 4xx", async () => {
    const fetchFn = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: "Wallet not found" }), {
          status: 404,
        }),
    );
    const ps = new Paysmith({
      apiKey: "ps_test_x",
      fetch: fetchFn as unknown as typeof fetch,
    });
    await expect(ps.getBalance("missing")).rejects.toMatchObject({
      name: "PaysmithError",
      status: 404,
      message: "Wallet not found",
    } satisfies Partial<PaysmithError>);
  });

  it("newIdempotencyKey is unique-ish", () => {
    const a = newIdempotencyKey();
    const b = newIdempotencyKey();
    expect(a).not.toBe(b);
    expect(a.startsWith("ps_")).toBe(true);
  });

  it("listWallets hits agents-balance without query", async () => {
    const fetchFn = vi.fn(
      async () =>
        new Response(JSON.stringify({ wallets: [], count: 0 }), {
          status: 200,
        }),
    );
    const ps = new Paysmith({
      apiKey: "ps_test_x",
      fetch: fetchFn as unknown as typeof fetch,
    });
    await ps.listWallets();
    expect(String(fetchFn.mock.calls[0][0])).toBe(
      `${DEFAULT_BASE_URL}/agents-balance`,
    );
  });
});
