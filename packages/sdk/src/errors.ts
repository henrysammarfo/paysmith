export class PaysmithError extends Error {
  status: number;
  body: unknown;
  retryAfter?: number;

  constructor(message: string, status: number, body: unknown, retryAfter?: number) {
    super(message);
    this.name = "PaysmithError";
    this.status = status;
    this.body = body;
    this.retryAfter = retryAfter;
  }
}
