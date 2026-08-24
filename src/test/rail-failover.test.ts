import { describe, it, expect } from "vitest";

/** Mirrors /pay fiat failover decision (no network) */
function pickFiatRail(opts: {
  preferRail?: string;
  paystack?: { status: string; provider: string } | null;
  flutterwave?: { status: string; provider: string } | null;
}) {
  const prefer = (opts.preferRail || "").toLowerCase();
  if (prefer === "flutterwave") {
    return opts.flutterwave ?? { status: "failed", provider: "flutterwave" };
  }
  if (opts.paystack && opts.paystack.status !== "failed") return opts.paystack;
  if (opts.flutterwave && opts.flutterwave.status !== "failed") return opts.flutterwave;
  if (opts.flutterwave?.status === "failed") return opts.flutterwave;
  if (opts.paystack?.status === "failed") return opts.paystack;
  return { status: "settled", provider: "sandbox" };
}

describe("fiat rail failover", () => {
  it("uses Paystack when pending", () => {
    const r = pickFiatRail({
      paystack: { status: "pending", provider: "paystack" },
      flutterwave: { status: "pending", provider: "flutterwave" },
    });
    expect(r.provider).toBe("paystack");
  });

  it("fails over to Flutterwave when Paystack failed", () => {
    const r = pickFiatRail({
      paystack: { status: "failed", provider: "paystack" },
      flutterwave: { status: "pending", provider: "flutterwave" },
    });
    expect(r.provider).toBe("flutterwave");
  });

  it("honors preferRail=flutterwave", () => {
    const r = pickFiatRail({
      preferRail: "flutterwave",
      paystack: { status: "pending", provider: "paystack" },
      flutterwave: { status: "pending", provider: "flutterwave" },
    });
    expect(r.provider).toBe("flutterwave");
  });
});
