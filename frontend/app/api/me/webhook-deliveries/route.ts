import { webhookDeliveries, webhooks } from "@disputr/db";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const deliveries = await db
    .select({
      id: webhookDeliveries.id,
      webhookId: webhookDeliveries.webhookId,
      webhookUrl: webhooks.url,
      event: webhookDeliveries.event,
      status: webhookDeliveries.status,
      attempts: webhookDeliveries.attempts,
      createdAt: webhookDeliveries.createdAt,
      updatedAt: webhookDeliveries.updatedAt
    })
    .from(webhookDeliveries)
    .innerJoin(webhooks, eq(webhookDeliveries.webhookId, webhooks.id))
    .where(eq(webhooks.userId, user.id))
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(8);

  return NextResponse.json({ deliveries });
}
