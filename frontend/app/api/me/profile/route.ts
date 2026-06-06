import { users } from "@disputr/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { isEmailConflictError, isSchemaMismatchError } from "@/lib/server/db-errors";
import { notifyUser } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().max(180).or(z.literal("")).optional(),
  notificationInApp: z.boolean().optional(),
  notificationEmail: z.boolean().optional()
});

export async function GET() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("profile GET: getCurrentUser failed", error);
    if (isSchemaMismatchError(error)) {
      return NextResponse.json({ error: "database_schema_mismatch" }, { status: 500 });
    }

    return NextResponse.json({ error: "db_unavailable" }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
      notificationInApp: user.notificationInApp,
      notificationEmail: user.notificationEmail
    }
  });
}

export async function PATCH(request: Request) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("profile PATCH: getCurrentUser failed", error);
    if (isSchemaMismatchError(error)) {
      return NextResponse.json({ error: "database_schema_mismatch" }, { status: 500 });
    }

    return NextResponse.json({ error: "db_unavailable" }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const db = getDb();
    const [updated] = await db
      .update(users)
      .set({
        ...("name" in parsed.data ? { name: parsed.data.name } : {}),
        ...("email" in parsed.data ? { email: parsed.data.email || null } : {}),
        ...("notificationInApp" in parsed.data ? { notificationInApp: parsed.data.notificationInApp } : {}),
        ...("notificationEmail" in parsed.data ? { notificationEmail: parsed.data.notificationEmail } : {}),
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "profile_update_failed" }, { status: 500 });
    }

    const shouldConfirmEmail =
      parsed.data.notificationEmail === true &&
      Boolean(updated.email) &&
      (!user.notificationEmail || user.email !== updated.email);

    const emailConfirmation = shouldConfirmEmail
      ? await notifyUser(db, {
          userId: updated.id,
          type: "notifications.email_enabled",
          title: "Email notifications enabled",
          body: "Disputr will send dispute, verdict, API key, and webhook updates to this address.",
          href: "/settings"
        }).catch((error) => {
          console.error("profile PATCH: notifyUser failed", error);
          return undefined;
        })
      : undefined;

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        walletAddress: updated.walletAddress,
        notificationInApp: updated.notificationInApp,
        notificationEmail: updated.notificationEmail
      },
      emailConfirmation
    });
  } catch (error) {
    console.error("profile PATCH: update failed", error);
    if (isEmailConflictError(error)) {
      return NextResponse.json({ error: "email_in_use" }, { status: 409 });
    }

    if (isSchemaMismatchError(error)) {
      return NextResponse.json({ error: "database_schema_mismatch" }, { status: 500 });
    }

    return NextResponse.json({ error: "db_unavailable" }, { status: 500 });
  }
}
