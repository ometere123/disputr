import { ArrowRight, Clock, FileText, Gavel, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ContractStatus } from "@/components/contract-status";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell active="Disputes">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          eyebrow={<Badge variant="warning">Contract Case</Badge>}
          title={`Dispute #${id}`}
          description="Contract and database records for this dispute will appear here once the case has been opened and indexed."
          action={
            <Button asChild>
              <Link href={`/disputes/${id}/respond`}>
                Respond <ArrowRight className="size-5" />
              </Link>
            </Button>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[#ead1c2] p-4 text-primary">
                <FileText className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">Evidence Timeline</h2>
                <p className="text-muted-foreground">Evidence CIDs and response status from the contract/indexer.</p>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-dashed border-border bg-[#fff4eb] p-6">
              <p className="font-bold text-primary">No indexed evidence timeline yet</p>
              <p className="mt-2 text-muted-foreground">
                Claimant evidence, respondent evidence, scope CID, and evaluation readiness will populate this section after real records are available.
              </p>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="size-6 text-primary" />
                <h2 className="text-2xl font-extrabold">Response Window</h2>
              </div>
              <p className="mt-6 text-3xl font-extrabold text-primary">Not indexed</p>
              <p className="mt-2 text-muted-foreground">The contract response deadline will appear here after this dispute is read from chain.</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Gavel className="size-6 text-primary" />
                <h2 className="text-2xl font-extrabold">On-chain Status</h2>
              </div>
              <div className="mt-5">
                <ContractStatus />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                The UI remains usable before deployed contract addresses are added.
              </p>
            </Card>
            <Button asChild className="w-full">
              <Link href={`/disputes/${id}/verdict`}>
                <ShieldCheck className="size-5" />
                View Verdict
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
