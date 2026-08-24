import { describe, it, expect } from "vitest";

function toPolicyI128(n: number): bigint {
  return BigInt(Math.round(Number(n) * 1_000_000));
}

function mapSorobanCode(code: number): string {
  const labels: Record<number, string> = {
    1: "OverSingleTxLimit",
    2: "OverDailyLimit",
    3: "NegativeAmount",
  };
  return labels[code] || `Contract#${code}`;
}

describe("soroban policy scaling", () => {
  it("scales fractional amounts consistently", () => {
    expect(toPolicyI128(0.5)).toBe(500_000n);
    expect(toPolicyI128(1)).toBe(1_000_000n);
    expect(toPolicyI128(201)).toBe(201_000_000n);
  });

  it("maps contract error codes", () => {
    expect(mapSorobanCode(1)).toBe("OverSingleTxLimit");
    expect(mapSorobanCode(2)).toBe("OverDailyLimit");
  });
});
