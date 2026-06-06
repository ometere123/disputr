import { webhookDeliveries, webhooks } from "@disputr/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { signWebhookPayload } from "@/lib/server/crypto";
import { getDb } from "@/lib/server/db";
import { notifyUser } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const [hook] = await db
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.id, id), eq(webhooks.userId, user.id)))
    .limit(1);

  if (!hook) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!hook.active) {
    return NextResponse.json({ error: "webhook_inactive" }, { status: 400 });
  }

  const payload = {
    event: "verdict.delivered",
    test: true,
    dispute_id: "test_dispute",
    verdict: "test_delivery",
    confidence: 1,
    release_to: user.walletAddress ?? "0x0000000000000000000000000000000000000000"
  };

  const [delivery] = await db
    .insert(webhookDeliveries)
    .values({
      webhookId: hook.id,
      event: "verdict.delivered",
      payload,
      status: "queued",
      nextRetry: new Date()
    })
    .returning();

  if (!delivery) {
    return NextResponse.json({ error: "delivery_create_failed" }, { status: 500 });
  }

  let statusCode = 0;
  let statusText = "Network error";

  try {
    const body = JSON.stringify(payload);
    const { timestamp, signature } = signWebhookPayload(body, hook.secret);
    const response = await fetch(hook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Disputr-Timestamp": String(timestamp),
        "Disputr-Signature": signature
      },
      body
    });
    statusCode = response.status;
    statusText = response.statusText || "Response received";
  } catch (error) {
    statusText = error instanceof Error ? error.message : "Webhook request failed";
  }

  const delivered = statusCode >= 200 && statusCode < 300;
  await db
    .update(webhookDeliveries)
    .set({
      status: delivered ? "delivered" : "failed",
      attempts: 1,
      nextRetry: delivered ? null : new Date(Date.now() + 60_000),
      updatedAt: new Date()
    })
    .where(eq(webhookDeliveries.id, delivery.id));

  await notifyUser(db, {
    userId: user.id,
    type: delivered ? "webhook.test_delivered" : "webhook.test_failed",
    title: delivered ? "Webhook test delivered" : "Webhook test failed",
    body: delivered
      ? `Your endpoint accepted the test delivery with HTTP ${statusCode}.`
      : `Your endpoint did not accept the test delivery. Status: ${statusCode || statusText}.`,
    href: "/developers",
    payload: { deliveryId: delivery.id, statusCode, statusText }
  });

  return NextResponse.json({
    ok: delivered,
    deliveryId: delivery.id,
    statusCode,
    statusText
  });
}
