import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { VerdictPanel } from "@/components/verdict-panel";
import { getVerdictForDispute, toVerdictPanelData } from "@/lib/server/dispute-data";

export const dynamic = "force-dynamic";

export default async function VerdictPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { verdict } = await getVerdictForDispute(id);
  const panelData = verdict ? toVerdictPanelData(verdict) : null;

  return (
    <AppShell active="Disputes">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          eyebrow={
            <div className="flex items-center gap-3">
              <Badge variant={verdict ? "success" : "warning"}>{verdict ? "Verdict Delivered" : "Verdict Pending"}</Badge>
              <span className="text-muted-foreground">Case #{id}</span>
            </div>
          }
          title={`Dispute #${id} Verdict`}
          description={
            verdict
              ? "Structured GenLayer verdict data from the database/indexer."
              : "Structured verdict data will appear after GenLayer evaluation has committed the result on-chain."
          }
        />
        <div className="mt-8">
          <VerdictPanel verdict={panelData} />
        </div>
      </div>
    </AppShell>
  );
}
