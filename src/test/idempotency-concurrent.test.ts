import { describe, it, expect } from "vitest";

/**
 * Concurrent /pay with the same Idempotency-Key must behave as a single logical payment:
 * - first writer wins the insert (or equivalent claim)
 * - losers either wait and replay, or get 409 / in-flight
 * - ledger debit count = 1 for a successful settle
 */
type IdemState = {
  response_status: number | null;
  response_body: Record<string, unknown> | null;
  claimed_by: string | null;
};

function claimOrReplay(
  store: Map<string, IdemState>,
  key: string,
  workerId: string,
): { kind: "claim" } | { kind: "replay"; status: number; body: Record<string, unknown> } | { kind: "inflight" } {
  const existing = store.get(key);
  if (!existing) {
    store.set(key, { response_status: null, response_body: null, claimed_by: workerId });
    return { kind: "claim" };
  }
  if (existing.response_status != null && existing.response_body) {
    return { kind: "replay", status: existing.response_status, body: existing.response_body };
  }
  if (existing.claimed_by && existing.claimed_by !== workerId) {
    return { kind: "inflight" };
  }
  return { kind: "claim" };
}

function complete(store: Map<string, IdemState>, key: string, status: number, body: Record<string, unknown>) {
  const row = store.get(key);
  if (!row) throw new Error("missing claim");
  row.response_status = status;
  row.response_body = body;
}

describe("concurrent idempotency stress (unit)", () => {
  it("only one worker claims; others inflight or replay", () => {
    const store = new Map<string, IdemState>();
    const key = "stress_order_1";

    const a = claimOrReplay(store, key, "w1");
    const b = claimOrReplay(store, key, "w2");
    const c = claimOrReplay(store, key, "w3");

    expect(a.kind).toBe("claim");
    expect(b.kind).toBe("inflight");
    expect(c.kind).toBe("inflight");

    complete(store, key, 200, { txId: "T1", amount: 1 });

    const d = claimOrReplay(store, key, "w4");
    expect(d.kind).toBe("replay");
    if (d.kind === "replay") {
      expect(d.status).toBe(200);
      expect(d.body.txId).toBe("T1");
    }
  });

  it("simulates N parallel arrivals → exactly one claim", () => {
    const store = new Map<string, IdemState>();
    const key = "stress_parallel";
    const results = Array.from({ length: 50 }, (_, i) => claimOrReplay(store, key, `w${i}`));
    const claims = results.filter((r) => r.kind === "claim");
    const inflight = results.filter((r) => r.kind === "inflight");
    expect(claims).toHaveLength(1);
    expect(inflight).toHaveLength(49);
  });

  it("debit-fail 500 is replayable and blocks second rail", () => {
    const store = new Map<string, IdemState>();
    const key = "debit_fail";
    expect(claimOrReplay(store, key, "w1").kind).toBe("claim");
    complete(store, key, 500, { error: "ledger debit failed", txId: "RAIL_1" });
    const replay = claimOrReplay(store, key, "w2");
    expect(replay.kind).toBe("replay");
    if (replay.kind === "replay") {
      expect(replay.status).toBe(500);
      expect(replay.body.txId).toBe("RAIL_1");
    }
  });
});
