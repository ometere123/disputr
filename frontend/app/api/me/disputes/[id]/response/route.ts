import { disputes } from "@disputr/db";
import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { notifyUser } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

const responseSchema = z.object({
  respondentCid: z.string().trim().min(10).max(128),
  onChainTx: z.string().trim().max(140).optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user?.walletAddress) {
    return NextResponse.json({ error: "wallet_session_required" }, { status: 401 });
  }

  const parsed = responseSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  }

  const { id } = await params;
  const address = user.walletAddress.toLowerCase();
  const db = getDb();
  const [updated] = await db
    .update(disputes)
    .set({
      respondentCid: parsed.data.respondentCid,
      status: "ready_for_evaluation",
      onChainTx: parsed.data.onChainTx,
      updatedAt: new Date()
    })
    .where(and(eq(disputes.id, id), or(eq(disputes.claimant, address), eq(disputes.respondent, address))))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await notifyUser(db, {
    userId: user.id,
    type: "dispute.response_submitted",
    title: "Evidence submitted",
    body: `Dispute ${updated.id} is ready for evaluation.`,
    href: `/disputes/${updated.id}`
  });

  return NextResponse.json({ dispute: updated });
}
