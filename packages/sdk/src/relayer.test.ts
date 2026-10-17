import { describe, expect, it } from "vitest";
import { OpenZeppelinRelayerClient, createRelayerFromEnv } from "./relayer.js";

describe("OpenZeppelinRelayerClient", () => {
  it("returns scaffold when unconfigured", async () => {
    const client = new OpenZeppelinRelayerClient();
    expect(client.ready).toBe(false);
    const res = await client.submit({
      network: "testnet",
      xdr: "AAAA",
      idempotencyKey: "test-1",
    });
    expect(res.status).toBe("scaffold");
    expect(res.note).toMatch(/PAYSMITH_OZ_RELAYER/);
  });

  it("createRelayerFromEnv reads env keys", () => {
    const c = createRelayerFromEnv({
      PAYSMITH_OZ_RELAYER_URL: "https://relayer.example",
      PAYSMITH_OZ_RELAYER_API_KEY: "k",
    });
    expect(c.ready).toBe(true);
  });
});
