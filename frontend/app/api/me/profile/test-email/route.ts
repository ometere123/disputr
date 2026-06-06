import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { notifyUser } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!user.email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  if (!user.notificationEmail) {
    return NextResponse.json({ error: "email_notifications_disabled" }, { status: 400 });
  }

  const db = getDb();
  const result = await notifyUser(db, {
    userId: user.id,
    type: "notifications.test_email",
    title: "Test email delivered",
    body: "Your Disputr email notification channel is connected.",
    href: "/settings"
  });

  return NextResponse.json({ ok: true, result });
}
