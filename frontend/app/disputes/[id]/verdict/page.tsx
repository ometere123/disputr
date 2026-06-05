import { Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerdictPanel } from "@/components/verdict-panel";

export default async function VerdictPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell active="Case History">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          eyebrow={
            <div className="flex items-center gap-3">
              <Badge variant="success">Verdict Delivered</Badge>
              <span className="text-muted-foreground">Case #{id}</span>
            </div>
          }
          title="Freelance Contract Dispute"
          description="Arbitration finalized. Funds can be distributed by the integrated escrow protocol after finality."
          action={
            <Button variant="outline">
              <Download className="size-5" />
              Export Report
            </Button>
          }
        />
        <div className="mt-20">
          <VerdictPanel />
        </div>
      </div>
    </AppShell>
  );
}
