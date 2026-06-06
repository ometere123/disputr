import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export type DisputeTableRow = {
  id: string;
  title: string;
  amount?: string;
  status: string;
  action?: string;
  href: string;
};

function variantForStatus(status: string) {
  if (status === "Resolved") {
    return "success" as const;
  }
  if (status === "Evaluating") {
    return "default" as const;
  }
  return "warning" as const;
}

export function DisputeTable({
  disputes = [],
  emptyTitle = "No disputes yet",
  emptyDescription = "Contract or database-backed disputes will appear here once they are created."
}: {
  disputes?: DisputeTableRow[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-card shadow-soft">
      <div className="grid grid-cols-[0.8fr_2fr_1.1fr_1.1fr_0.9fr] gap-4 border-b border-border bg-[#fff4eb] px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">
        <span>Case ID</span>
        <span>Description</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      {disputes.length ? (
        disputes.map((dispute) => (
          <div
            key={dispute.id}
            className="grid grid-cols-[0.8fr_2fr_1.1fr_1.1fr_0.9fr] gap-4 border-b border-border px-6 py-5 last:border-b-0"
          >
            <span className="font-bold text-primary">{dispute.id}</span>
            <span className="truncate text-foreground">{dispute.title}</span>
            <span>{dispute.amount ?? "-"}</span>
            <span>
              <Badge variant={variantForStatus(dispute.status)}>{dispute.status}</Badge>
            </span>
            <Link href={dispute.href} className="font-semibold text-primary">
              {dispute.action ?? "Details"}
            </Link>
          </div>
        ))
      ) : (
        <div className="px-6 py-12 text-center">
          <p className="text-lg font-bold text-primary">{emptyTitle}</p>
          <p className="mt-2 text-muted-foreground">{emptyDescription}</p>
        </div>
      )}
    </div>
  );
}
