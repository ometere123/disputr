import Link from "next/link";
import { MoveRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export function MobileActionCards() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-primary">Action Required</h2>
        <Link href="/disputes" className="flex items-center gap-1 font-semibold text-primary">
          View All <MoveRight className="size-4" />
        </Link>
      </div>
      <EmptyState
        title="No action required"
        description="Disputes that need evidence, review, or appeal actions will appear here."
        action={{ href: "/disputes/new", label: "Open New Dispute" }}
      />
    </div>
  );
}
