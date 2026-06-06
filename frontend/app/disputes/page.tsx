import { Plus } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DisputeTable } from "@/components/dispute-table";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { getUserDisputes, toDisputeTableRow } from "@/lib/server/dispute-data";

export const dynamic = "force-dynamic";

function firstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function DisputesPage({ searchParams }: { searchParams?: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const search = firstSearchParam(params?.q).trim();
  const disputes = await getUserDisputes({ search });
  const tableRows = disputes.map(toDisputeTableRow);

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
        {search ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4">
            <p className="font-semibold text-primary">
              Search results for <span className="font-mono">{search}</span>
            </p>
            <Link href="/disputes" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Clear search
            </Link>
          </div>
        ) : null}
        <div className="mt-8 hidden md:block">
          <DisputeTable
            disputes={tableRows}
            emptyTitle={search ? "No matching disputes" : "No disputes yet"}
            emptyDescription={
              search
                ? "Try a case ID, wallet address, status, evidence CID, or transaction hash."
                : "Contract or database-backed disputes will appear here once they are created."
            }
          />
        </div>
        <div className="mt-8 md:hidden">
          {tableRows.length ? (
            <DisputeTable disputes={tableRows} />
          ) : (
            <EmptyState
              title={search ? "No matching disputes" : "No active disputes"}
              description={
                search
                  ? "Try a case ID, wallet address, status, evidence CID, or transaction hash."
                  : "Contract or database-backed disputes will appear here once they are created."
              }
              action={search ? { href: "/disputes", label: "Clear Search" } : { href: "/disputes/new", label: "Open New Dispute" }}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
