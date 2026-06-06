import { apiKeys } from "@disputr/db";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { notifyUser } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const [revoked] = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, user.id), isNull(apiKeys.revokedAt)))
    .returning();

  if (!revoked) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await notifyUser(db, {
    userId: user.id,
    type: "api_key.revoked",
    title: "API key revoked",
    body: `${revoked.label} can no longer access Disputr APIs.`,
    href: "/developers"
  });

  return NextResponse.json({ apiKey: revoked });
}
