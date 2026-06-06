import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { isSchemaMismatchError } from "@/lib/server/db-errors";
import { notifyUser } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

export async function POST() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("test-email POST: getCurrentUser failed", error);
    if (isSchemaMismatchError(error)) {
      return NextResponse.json({ error: "database_schema_mismatch" }, { status: 500 });
    }

    return NextResponse.json({ error: "db_unavailable" }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!user.email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  if (!user.notificationEmail) {
    return NextResponse.json({ error: "email_notifications_disabled" }, { status: 400 });
  }

  try {
    const db = getDb();
    const result = await notifyUser(db, {
      userId: user.id,
      type: "notifications.test_email",
      title: "Test email delivered",
      body: "Your Disputr email notification channel is connected.",
      href: "/settings"
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("test-email POST: notifyUser failed", error);
    if (isSchemaMismatchError(error)) {
      return NextResponse.json({ error: "database_schema_mismatch" }, { status: 500 });
    }

    return NextResponse.json({ error: "db_unavailable" }, { status: 500 });
  }
}
