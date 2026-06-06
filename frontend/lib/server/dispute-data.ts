import { credentials, disputes, verdicts, wallets, type Dispute, type Verdict } from "@disputr/db";
import { desc, eq, inArray, or } from "drizzle-orm";
import { getDb } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/user";
import { compactAddress } from "@/lib/utils";

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_response: "Pending Response",
    ready_for_evaluation: "Evaluating",
    resolved: "Resolved",
    appealed: "Appealed",
    pending: "Pending"
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

async function getCurrentUserAddresses() {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, addresses: [] as string[] };
  }

  const db = getDb();
  const linkedWallets = await db.select().from(wallets).where(eq(wallets.userId, user.id));
  const addresses = new Set(linkedWallets.map((wallet) => wallet.address.toLowerCase()));

  if (user.walletAddress) {
    addresses.add(user.walletAddress.toLowerCase());
  }

  return { user, addresses: [...addresses] };
}

export function toDisputeTableRow(dispute: Dispute) {
  return {
    id: dispute.id,
    title: `${compactAddress(dispute.claimant)} vs ${compactAddress(dispute.respondent)}`,
    amount: `${Number(dispute.stakeGen).toLocaleString()} GEN`,
    status: statusLabel(dispute.status),
    action: dispute.status === "resolved" ? "View Verdict" : "Details",
    href: dispute.status === "resolved" ? `/disputes/${dispute.id}/verdict` : `/disputes/${dispute.id}`
  };
}

export async function getUserDisputes(limit = 50) {
  const { addresses } = await getCurrentUserAddresses();

  if (!addresses.length) {
    return [];
  }

  const db = getDb();
  return db
    .select()
    .from(disputes)
    .where(or(inArray(disputes.claimant, addresses), inArray(disputes.respondent, addresses)))
    .orderBy(desc(disputes.createdAt))
    .limit(limit);
}

export async function getDisputeForCurrentUser(id: string) {
  const { addresses } = await getCurrentUserAddresses();

  if (!addresses.length) {
    return null;
  }

  const db = getDb();
  const rows = await db.select().from(disputes).where(eq(disputes.id, id)).limit(1);
  const dispute = rows[0];
  if (!dispute) {
    return null;
  }

  return addresses.includes(dispute.claimant.toLowerCase()) || addresses.includes(dispute.respondent.toLowerCase()) ? dispute : null;
}

export async function getVerdictForDispute(disputeId: string) {
  const dispute = await getDisputeForCurrentUser(disputeId);

  if (!dispute) {
    return { dispute: null, verdict: null };
  }

  const db = getDb();
  const [verdict] = await db.select().from(verdicts).where(eq(verdicts.disputeId, disputeId)).limit(1);
  return { dispute, verdict: verdict ?? null };
}

export async function getUserCredentials() {
  const { addresses } = await getCurrentUserAddresses();

  if (!addresses.length) {
    return [];
  }

  const db = getDb();
  return db
    .select()
    .from(credentials)
    .where(inArray(credentials.walletAddress, addresses))
    .orderBy(desc(credentials.mintedAt))
    .limit(50);
}

export function toVerdictPanelData(verdict: Verdict) {
  const evidenceWeights = verdict.evidenceWeights.length
    ? verdict.evidenceWeights
    : [
        { side: "claimant" as const, source: "Claimant evidence", weight: Number(verdict.claimantWeight), confidence: "Indexed" },
        { side: "respondent" as const, source: "Respondent evidence", weight: Number(verdict.respondentWeight), confidence: "Indexed" }
      ];

  const claimantSources = evidenceWeights
    .filter((item) => item.side === "claimant")
    .map((item) => [item.source, item.confidence] as [string, string]);
  const respondentSources = evidenceWeights
    .filter((item) => item.side === "respondent")
    .map((item) => [item.source, item.confidence] as [string, string]);

  return {
    id: verdict.id,
    confidence: Number(verdict.confidence),
    summary: verdict.reasoning,
    trace: verdict.reasoningTrace,
    credentialExplorerHref: verdict.onChainTx ? `https://studio.genlayer.com/transactions/${verdict.onChainTx}` : undefined,
    weights: [
      {
        side: "Claimant Evidence",
        value: Number(verdict.claimantWeight),
        sources: claimantSources
      },
      {
        side: "Respondent Evidence",
        value: Number(verdict.respondentWeight),
        sources: respondentSources
      }
    ]
  };
}
