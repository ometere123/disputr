import { appeals, disputes, notifications } from "@disputr/db";
import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

const appealSchema = z.object({
  appealCid: z.string().trim().min(10).max(128),
  stakeGen: z.string().regex(/^\d+(\.\d{1,18})?$/).default("0"),
  onChainTx: z.string().trim().max(140).optional()
});

function appealId() {
  return `apl_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user?.walletAddress) {
    return NextResponse.json({ error: "wallet_session_required" }, { status: 401 });
  }

  const parsed = appealSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  }

  const { id } = await params;
  const address = user.walletAddress.toLowerCase();
  const db = getDb();
  const [dispute] = await db
    .select()
    .from(disputes)
    .where(and(eq(disputes.id, id), or(eq(disputes.claimant, address), eq(disputes.respondent, address))))
    .limit(1);

  if (!dispute) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [record] = await db
    .insert(appeals)
    .values({
      id: appealId(),
      disputeId: dispute.id,
      appellant: address,
      stakeGen: parsed.data.stakeGen,
      appealCid: parsed.data.appealCid,
      status: "pending"
    })
    .returning();

  if (!record) {
    return NextResponse.json({ error: "appeal_create_failed" }, { status: 500 });
  }

  await db
    .update(disputes)
    .set({ status: "appealed", onChainTx: parsed.data.onChainTx, updatedAt: new Date() })
    .where(eq(disputes.id, dispute.id));

  await db.insert(notifications).values({
    userId: user.id,
    type: "appeal.initiated",
    title: "Appeal filed",
    body: `Appeal ${record.id} is pending review.`,
    href: `/disputes/${dispute.id}/appeal`
  });

  return NextResponse.json({ appeal: record }, { status: 201 });
}
