import { ArrowRight, Clock, FileText, Gavel, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ContractStatus } from "@/components/contract-status";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { statusLabel } from "@/lib/dispute-search";
import { getDisputeForCurrentUser } from "@/lib/server/dispute-data";
import { compactAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dispute = await getDisputeForCurrentUser(id);

  return (
    <AppShell active="Disputes">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          eyebrow={<Badge variant={dispute?.status === "resolved" ? "success" : "warning"}>{dispute ? statusLabel(dispute.status) : "Not Indexed"}</Badge>}
          title={`Dispute #${id}`}
          description={
            dispute
              ? `${compactAddress(dispute.claimant)} vs ${compactAddress(dispute.respondent)}`
              : "Contract and database records for this dispute will appear here once the case has been opened and indexed."
          }
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
            {dispute ? (
              <div className="mt-6 grid gap-4">
                <EvidenceRow label="Claimant evidence" value={dispute.claimantCid} />
                <EvidenceRow label="Respondent evidence" value={dispute.respondentCid ?? "Awaiting respondent evidence"} />
                <EvidenceRow label="Scope document" value={dispute.scopeDocHash ?? "No scope CID recorded"} />
                <EvidenceRow label="On-chain transaction" value={dispute.onChainTx ?? "Awaiting indexer transaction hash"} />
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-border bg-[#fff4eb] p-6">
                <p className="font-bold text-primary">No indexed evidence timeline yet</p>
                <p className="mt-2 text-muted-foreground">
                  Claimant evidence, respondent evidence, scope CID, and evaluation readiness will populate this section after real records are available.
                </p>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="size-6 text-primary" />
              <h2 className="text-2xl font-extrabold">Response Window</h2>
              </div>
              <p className="mt-6 text-3xl font-extrabold text-primary">
                {dispute?.appealWindowExpires ? new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", hour: "numeric" }).format(dispute.appealWindowExpires) : "Not indexed"}
              </p>
              <p className="mt-2 text-muted-foreground">Response and appeal windows are refreshed from database/indexer records.</p>
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
                {dispute ? `Stake: ${Number(dispute.stakeGen).toLocaleString()} GEN` : "The UI remains usable before deployed contract addresses are added."}
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

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-[#fff4eb] p-4">
      <p className="text-sm font-bold uppercase text-primary">{label}</p>
      <p className="mt-2 break-all font-mono text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
