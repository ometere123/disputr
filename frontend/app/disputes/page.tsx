import { Plus } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DisputeTable } from "@/components/dispute-table";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";

export default function DisputesPage() {
  return (
    <AppShell active="Disputes">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          title="Disputes"
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
        <div className="mt-8 hidden md:block">
          <DisputeTable />
        </div>
        <div className="mt-8 md:hidden">
          <EmptyState
            title="No active disputes"
            description="Contract or database-backed disputes will appear here once they are created."
            action={{ href: "/disputes/new", label: "Open New Dispute" }}
          />
        </div>
      </div>
    </AppShell>
  );
}
