import { webhooks } from "@disputr/db";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateWebhookSecret } from "@/lib/server/crypto";
import { getDb } from "@/lib/server/db";
import { notifyUser } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

const webhookSchema = z.object({
  url: z.string().trim().url().refine((value) => value.startsWith("https://"), "Webhook endpoint must use HTTPS."),
  events: z.array(z.literal("verdict.delivered")).min(1).default(["verdict.delivered"])
});

function secretHint(secret: string) {
  return `${secret.slice(0, 10)}...${secret.slice(-4)}`;
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.userId, user.id))
    .orderBy(desc(webhooks.createdAt));

  return NextResponse.json({
    webhooks: rows.map(({ secret, ...webhook }) => ({
      ...webhook,
      secretHint: secretHint(secret)
    }))
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = webhookSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  }

  const db = getDb();
  const secret = generateWebhookSecret();
  const [record] = await db
    .insert(webhooks)
    .values({
      userId: user.id,
      url: parsed.data.url,
      secret,
      events: parsed.data.events,
      active: true
    })
    .returning();

  if (!record) {
    return NextResponse.json({ error: "webhook_create_failed" }, { status: 500 });
  }

  await notifyUser(db, {
    userId: user.id,
    type: "webhook.created",
    title: "Webhook saved",
    body: "Verdict delivery events will be signed and sent to your endpoint.",
    href: "/developers"
  });

  return NextResponse.json(
    {
      webhook: {
        id: record.id,
        userId: record.userId,
        url: record.url,
        events: record.events,
        active: record.active,
        createdAt: record.createdAt,
        secretHint: secretHint(secret)
      },
      signingSecret: secret
    },
    { status: 201 }
  );
}
