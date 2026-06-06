import { createHash, randomBytes } from "node:crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateApiKey(environment: "live" | "test" = "live") {
  return `dk_${environment}_${randomBytes(24).toString("base64url")}`;
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
