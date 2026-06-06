import { existsSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { apiKeys, auditLog, disputes, jobs, users, webhooks, createDb } from "@disputr/db";
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { generateApiKey, hashApiKey } from "../src/lib/crypto.js";
import type { WorkerBindings } from "../src/types.js";

function readEnvValue(name: string) {
  if (process.env[name]) {
    return process.env[name];
  }

  const envPath = [join(process.cwd(), ".env"), join(process.cwd(), "..", ".env"), join(process.cwd(), "..", "..", ".env")].find(
    (candidate) => existsSync(candidate)
  );
  if (!envPath) {
    return undefined;
  }

  const line = readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${name}=`));

  if (!line) {
    return undefined;
  }

  const raw = line.slice(name.length + 1).trim();
  return raw.replace(/^["']|["']$/g, "");
}

function address() {
  return `0x${randomBytes(20).toString("hex")}`;
}

const databaseUrl = readEnvValue("DATABASE_URL");
const run = databaseUrl ? describe : describe.skip;

run("B2B API e2e", () => {
  const db = createDb(databaseUrl);
  const createdUserIds: string[] = [];
  const createdApiKeyIds: string[] = [];
  const createdDisputeIds: string[] = [];
  const createdWebhookIds: string[] = [];
  let key = "";
  let readOnlyKey = "";
  let userId = "";

  const env: WorkerBindings = {
    DATABASE_URL: databaseUrl,
    NODE_ENV: "test",
    FRONTEND_ORIGIN: "http://localhost:3000",
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: ""
  };

  beforeAll(async () => {
    const wallet = address();
    const [user] = await db
      .insert(users)
      .values({
        name: "Disputr E2E",
        email: `e2e-${randomBytes(4).toString("hex")}@example.com`,
        walletAddress: wallet,
        authProvider: "wallet",
        notificationInApp: false,
        notificationEmail: false
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create e2e user");
    }

    userId = user.id;
    createdUserIds.push(user.id);

    key = generateApiKey("dk_live");
    const [record] = await db
      .insert(apiKeys)
      .values({
        userId,
        keyHash: hashApiKey(key),
        prefix: key.slice(0, 15),
        scopes: ["write:disputes", "read:verdicts", "write:webhooks"],
        label: "E2E key"
      })
      .returning();

    if (!record) {
      throw new Error("Failed to create e2e API key");
    }

    createdApiKeyIds.push(record.id);

    readOnlyKey = generateApiKey("dk_live");
    const [readOnlyRecord] = await db
      .insert(apiKeys)
      .values({
        userId,
        keyHash: hashApiKey(readOnlyKey),
        prefix: readOnlyKey.slice(0, 15),
        scopes: ["read:verdicts"],
        label: "E2E read only key"
      })
      .returning();

    if (!readOnlyRecord) {
      throw new Error("Failed to create read-only e2e API key");
    }

    createdApiKeyIds.push(readOnlyRecord.id);
  }, 20_000);

  afterAll(async () => {
    if (createdWebhookIds.length) {
      await db.delete(auditLog).where(inArray(auditLog.resourceId, createdWebhookIds));
      await db.delete(webhooks).where(inArray(webhooks.id, createdWebhookIds));
    }

    if (createdDisputeIds.length) {
      await db.delete(jobs).where(inArray(jobs.disputeId, createdDisputeIds));
      await db.delete(auditLog).where(inArray(auditLog.resourceId, createdDisputeIds));
      await db.delete(disputes).where(inArray(disputes.id, createdDisputeIds));
    }

    if (createdApiKeyIds.length) {
      await db.delete(apiKeys).where(inArray(apiKeys.id, createdApiKeyIds));
    }

    if (createdUserIds.length) {
      await db.delete(users).where(inArray(users.id, createdUserIds));
    }
  }, 20_000);

  it("accepts a generated dk_ key for dispute creation and records last use", async () => {
    const claimant = address();
    const response = await app.request(
      "/v1/dispute",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          escrow_address: address(),
          claimant,
          respondent: address(),
          evidence_bundle_hash: "bafybeigdyrztcasecid01",
          scope_doc_hash: "bafybeif7scopebundle",
          stake_gen: "0"
        })
      },
      env
    );

    expect(response.status).toBe(201);
    const body = (await response.json()) as { id: string; status: string };
    expect(body.id).toMatch(/^dsp_/);
    expect(body.status).toBe("pending_response");
    createdDisputeIds.push(body.id);

    const [stored] = await db.select().from(disputes).where(eq(disputes.id, body.id)).limit(1);
    expect(stored?.claimant).toBe(claimant.toLowerCase());

    const [storedKey] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, hashApiKey(key))).limit(1);
    expect(storedKey?.lastUsed).toBeInstanceOf(Date);
  }, 20_000);

  it("registers a signed webhook with the same generated key", async () => {
    const response = await app.request(
      "/v1/webhooks",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: "https://example.com/disputr/verdicts",
          events: ["verdict.delivered"]
        })
      },
      env
    );

    expect(response.status).toBe(201);
    const body = (await response.json()) as { webhook: { id: string; url: string }; signing_secret: string };
    expect(body.webhook.url).toBe("https://example.com/disputr/verdicts");
    expect(body.signing_secret).toMatch(/^whsec_/);
    createdWebhookIds.push(body.webhook.id);
  }, 20_000);

  it("rejects generated keys without the required scope", async () => {
    const response = await app.request(
      "/v1/dispute",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${readOnlyKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          escrow_address: address(),
          claimant: address(),
          respondent: address(),
          evidence_bundle_hash: "bafybeigdyrztcasecid02"
        })
      },
      env
    );

    expect(response.status).toBe(403);
    const body = (await response.json()) as { error: string; required_scope: string };
    expect(body.error).toBe("insufficient_scope");
    expect(body.required_scope).toBe("write:disputes");
  }, 20_000);
});
