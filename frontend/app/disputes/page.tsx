import { Plus } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DisputeTable } from "@/components/dispute-table";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";

export default function DisputesPage() {
  return (
    <AppShell active="Active Disputes">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          title="Active Disputes"
          description="Track response windows, evidence status, evaluation progress, and final verdicts."
          action={
            <Button asChild size="lg">
              <Link href="/disputes/new">
                <Plus className="size-5" />
                Open New Dispute
              </Link>
            </Button>
          }
        />
        <div className="mt-12 hidden md:block">
          <DisputeTable />
        </div>
        <div className="mt-12 md:hidden">
          <EmptyState
            title="Use desktop table view"
            description="Your active disputes remain available on mobile through the dashboard action cards."
            action={{ href: "/dashboard", label: "Back to Dashboard" }}
          />
        </div>
      </div>
    </AppShell>
  );
}
