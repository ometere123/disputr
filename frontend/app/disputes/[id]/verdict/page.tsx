import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { VerdictPanel } from "@/components/verdict-panel";

export default async function VerdictPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell active="Case History">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          eyebrow={
            <div className="flex items-center gap-3">
              <Badge variant="warning">Verdict Pending</Badge>
              <span className="text-muted-foreground">Case #{id}</span>
            </div>
          }
          title={`Dispute #${id} Verdict`}
          description="Structured verdict data will appear after GenLayer evaluation has committed the result on-chain."
        />
        <div className="mt-8">
          <VerdictPanel />
        </div>
      </div>
    </AppShell>
  );
}
