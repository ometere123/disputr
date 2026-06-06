import type { Dispute } from "@disputr/db";

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

function searchableDisputeText(dispute: Dispute) {
  return [
    dispute.id,
    dispute.claimant,
    dispute.respondent,
    dispute.claimantCid,
    dispute.respondentCid,
    dispute.scopeDocHash,
    dispute.status,
    statusLabel(dispute.status),
    dispute.onChainDisputeId,
    dispute.onChainTx,
    `${Number(dispute.stakeGen).toLocaleString()} GEN`
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterDisputes(disputeRows: Dispute[], search?: string) {
  const query = search?.trim().toLowerCase();
  if (!query) {
    return disputeRows;
  }

  const normalizedQuery = query.replace(/^#/, "").replace(/\s+/g, " ");
  return disputeRows.filter((dispute) => searchableDisputeText(dispute).includes(normalizedQuery));
}
