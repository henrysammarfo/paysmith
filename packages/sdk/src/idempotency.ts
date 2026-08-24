/** Generate a unique Idempotency-Key for /pay (Node 18+ / browsers). */
export function newIdempotencyKey(prefix = "ps"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
