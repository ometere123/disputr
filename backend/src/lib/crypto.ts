import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateApiKey(prefix = "dk_live") {
  return `${prefix}_${randomBytes(24).toString("base64url")}`;
}

export function hashApiKey(key: string) {
  if (!key.startsWith("dk_")) {
    throw new Error("Disputr API keys must use the dk_ prefix");
  }

  return sha256(key);
}

export function generateWebhookSecret() {
  return `whsec_${randomBytes(32).toString("base64url")}`;
}

export function signWebhookPayload(payload: string, secret: string, timestamp = Math.floor(Date.now() / 1000)) {
  const signed = `${timestamp}.${payload}`;
  const signature = createHmac("sha256", secret).update(signed).digest("hex");

  return {
    timestamp,
    signature: `v1=${signature}`
  };
}

export function verifySignature(payload: string, secret: string, timestamp: string, signature: string) {
  const expected = signWebhookPayload(payload, secret, Number(timestamp)).signature;
  const provided = Buffer.from(signature);
  const target = Buffer.from(expected);

  if (provided.length !== target.length) {
    return false;
  }

  return timingSafeEqual(provided, target);
}
