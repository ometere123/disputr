import { notifications, webhooks } from "@disputr/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const [removed] = await db
    .delete(webhooks)
    .where(and(eq(webhooks.id, id), eq(webhooks.userId, user.id)))
    .returning();

  if (!removed) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db.insert(notifications).values({
    userId: user.id,
    type: "webhook.deleted",
    title: "Webhook removed",
    body: "This endpoint will no longer receive Disputr events.",
    href: "/developers"
  });

  return NextResponse.json({ ok: true });
}
