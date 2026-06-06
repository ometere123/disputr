import { disputes, wallets } from "@disputr/db";
import { desc, eq, inArray, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { notifyUser } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
const cidSchema = z.string().trim().min(10).max(128);

const createDisputeSchema = z.object({
  respondent: addressSchema,
  claimantCid: cidSchema,
  scopeCid: cidSchema.optional().or(z.literal("")),
  stakeGen: z.string().regex(/^\d+(\.\d{1,18})?$/).default("0"),
  onChainTx: z.string().trim().max(140).optional(),
  onChainDisputeId: z.string().trim().max(140).optional()
});

function disputeId() {
  return `dsp_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

async function getUserAddresses(userId: string, fallback?: string | null) {
  const db = getDb();
  const linkedWallets = await db.select().from(wallets).where(eq(wallets.userId, userId));
  const addresses = new Set(linkedWallets.map((wallet) => wallet.address.toLowerCase()));

  if (fallback) {
    addresses.add(fallback.toLowerCase());
  }

  return [...addresses];
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const addresses = await getUserAddresses(user.id, user.walletAddress);
  if (!addresses.length) {
    return NextResponse.json({ disputes: [] });
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(disputes)
    .where(or(inArray(disputes.claimant, addresses), inArray(disputes.respondent, addresses)))
    .orderBy(desc(disputes.createdAt))
    .limit(50);

  return NextResponse.json({ disputes: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user?.walletAddress) {
    return NextResponse.json({ error: "wallet_session_required" }, { status: 401 });
  }

  const parsed = createDisputeSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  }

  const id = disputeId();
  const db = getDb();
  const [record] = await db
    .insert(disputes)
    .values({
      id,
      escrowAddress: "",
      claimant: user.walletAddress.toLowerCase(),
      respondent: parsed.data.respondent.toLowerCase(),
      claimantCid: parsed.data.claimantCid,
      scopeDocHash: parsed.data.scopeCid || null,
      stakeGen: parsed.data.stakeGen,
      onChainTx: parsed.data.onChainTx,
      onChainDisputeId: parsed.data.onChainDisputeId,
      appealWindowExpires: new Date(Date.now() + 72 * 60 * 60 * 1000),
      status: "pending_response"
    })
    .returning();

  if (!record) {
    return NextResponse.json({ error: "dispute_create_failed" }, { status: 500 });
  }

  await notifyUser(db, {
    userId: user.id,
    type: "dispute.created",
    title: "Dispute opened",
    body: `Dispute ${record.id} is waiting for respondent evidence.`,
    href: `/disputes/${record.id}`
  });

  return NextResponse.json({ dispute: record }, { status: 201 });
}
