import { webhookDeliveries, webhooks, type DbClient } from "@disputr/db";
import { and, eq } from "drizzle-orm";
import { signWebhookPayload } from "../lib/crypto.js";
import type { AppEnv } from "../types.js";
import type { Context } from "hono";

export type VerdictDeliveredPayload = {
  event: "verdict.delivered";
  dispute_id: string;
  verdict: string;
  confidence: number;
  release_to: string;
};

export async function queueVerdictDelivered(c: Context<AppEnv>, payload: VerdictDeliveredPayload) {
  const db = c.get("db");
  const identity = c.get("apiIdentity");
  if (!db || !identity) {
    return;
  }

  const hooks = await db
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.userId, identity.userId), eq(webhooks.active, true)));

  for (const hook of hooks) {
    if (!hook.events.includes("verdict.delivered")) {
      continue;
    }

    const [delivery] = await db.insert(webhookDeliveries).values({
      webhookId: hook.id,
      event: "verdict.delivered",
      payload,
      status: "queued",
      nextRetry: new Date()
    }).returning();

    if (delivery && c.env.WEBHOOK_RETRY_QUEUE) {
      c.executionCtx.waitUntil(c.env.WEBHOOK_RETRY_QUEUE.send({ deliveryId: delivery.id }));
    }
  }
}

export async function deliverWebhook(url: string, secret: string, payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  const { timestamp, signature } = signWebhookPayload(body, secret);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Disputr-Timestamp": String(timestamp),
      "Disputr-Signature": signature
    },
    body
  });

  return response.status;
}

export async function deliverQueuedWebhook(db: DbClient, deliveryId: string) {
  const [delivery] = await db.select().from(webhookDeliveries).where(eq(webhookDeliveries.id, deliveryId)).limit(1);
  if (!delivery) {
    return;
  }

  const [hook] = await db.select().from(webhooks).where(eq(webhooks.id, delivery.webhookId)).limit(1);
  if (!hook || !hook.active) {
    await db
      .update(webhookDeliveries)
      .set({ status: "skipped", attempts: delivery.attempts + 1, updatedAt: new Date() })
      .where(eq(webhookDeliveries.id, delivery.id));
    return;
  }

  const statusCode = await deliverWebhook(hook.url, hook.secret, delivery.payload);
  const delivered = statusCode >= 200 && statusCode < 300;

  await db
    .update(webhookDeliveries)
    .set({
      status: delivered ? "delivered" : "failed",
      attempts: delivery.attempts + 1,
      nextRetry: delivered ? null : new Date(Date.now() + Math.min(60_000 * 2 ** delivery.attempts, 60 * 60 * 1000)),
      updatedAt: new Date()
    })
    .where(eq(webhookDeliveries.id, delivery.id));

  if (!delivered) {
    throw new Error(`Webhook delivery failed with status ${statusCode}`);
  }
}
