import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { activeDisputes } from "@/lib/demo-data";

function variantForStatus(status: string) {
  if (status === "Resolved") {
    return "success" as const;
  }
  if (status === "Evaluating") {
    return "default" as const;
  }
  return "warning" as const;
}

export function DisputeTable() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-card shadow-soft">
      <div className="grid grid-cols-[0.8fr_2fr_1.1fr_1.1fr_0.9fr] gap-4 border-b border-border bg-[#fff4eb] px-8 py-5 text-sm font-semibold uppercase text-muted-foreground">
        <span>Case ID</span>
        <span>Description</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      {activeDisputes.map((dispute) => (
        <div
          key={dispute.id}
          className="grid grid-cols-[0.8fr_2fr_1.1fr_1.1fr_0.9fr] gap-4 border-b border-border px-8 py-7 last:border-b-0"
        >
          <span className="font-bold text-primary">{dispute.id}</span>
          <span className="truncate text-foreground">{dispute.title}</span>
          <span>{dispute.amount}</span>
          <span>
            <Badge variant={variantForStatus(dispute.status)}>{dispute.status}</Badge>
          </span>
          <Link href="/disputes/90210" className="font-semibold text-primary">
            {dispute.action}
          </Link>
        </div>
      ))}
    </div>
  );
}
