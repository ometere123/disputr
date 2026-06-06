import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { signWebhookPayload } from "../lib/server/crypto";

describe("signWebhookPayload", () => {
  it("signs timestamp-prefixed payloads with HMAC-SHA256", () => {
    const body = JSON.stringify({ event: "verdict.delivered", test: true });
    const secret = "whsec_test_secret";
    const timestamp = 1780713600;
    const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

    expect(signWebhookPayload(body, secret, timestamp)).toEqual({
      timestamp,
      signature: `v1=${expected}`
    });
  });
});
