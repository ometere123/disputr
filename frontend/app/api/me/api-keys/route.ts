import { apiKeys, apiScopes } from "@disputr/db";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateApiKey, hashApiKey } from "@/lib/server/crypto";
import { getDb } from "@/lib/server/db";
import { notifyUser } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

const bodySchema = z.object({
  label: z.string().trim().min(1).max(80).default("Production key"),
  environment: z.enum(["live", "test"]).default("live"),
  scopes: z.array(z.enum(apiScopes)).min(1).default(["read:verdicts", "write:disputes"])
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const rows = await db
    .select({
      id: apiKeys.id,
      label: apiKeys.label,
      prefix: apiKeys.prefix,
      scopes: apiKeys.scopes,
      lastUsed: apiKeys.lastUsed,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id))
    .orderBy(desc(apiKeys.createdAt));

  return NextResponse.json({ apiKeys: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  }

  const plaintext = generateApiKey(parsed.data.environment);
  const db = getDb();
  const [record] = await db
    .insert(apiKeys)
    .values({
      userId: user.id,
      keyHash: hashApiKey(plaintext),
      prefix: plaintext.slice(0, 15),
      scopes: parsed.data.scopes,
      label: parsed.data.label
    })
    .returning({
      id: apiKeys.id,
      label: apiKeys.label,
      prefix: apiKeys.prefix,
      scopes: apiKeys.scopes,
      createdAt: apiKeys.createdAt
    });

  if (!record) {
    return NextResponse.json({ error: "api_key_create_failed" }, { status: 500 });
  }

  await notifyUser(db, {
    userId: user.id,
    type: "api_key.created",
    title: "API key created",
    body: `${record.label} is ready for B2B requests.`,
    href: "/developers"
  });

  return NextResponse.json({ apiKey: record, plaintext }, { status: 201 });
}
