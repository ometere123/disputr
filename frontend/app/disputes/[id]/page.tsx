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
    <AppShell active="Active Disputes">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          eyebrow={<Badge variant="warning">Evidence Phase</Badge>}
          title="Freelance Contract Dispute"
          description={`Case ${id}. Evidence response window is open and the GenLayer evaluation will unlock after counter-evidence is submitted or the window expires.`}
          action={
            <Button asChild>
              <Link href={`/disputes/${id}/respond`}>
                Respond <ArrowRight className="size-5" />
              </Link>
            </Button>
          }
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <Card className="p-8">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[#ead1c2] p-4 text-primary">
                <FileText className="size-7" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">Evidence Timeline</h2>
                <p className="text-muted-foreground">Claimant evidence, scope CID, response window, and evaluation readiness.</p>
              </div>
            </div>
            <div className="mt-8 space-y-6">
              {[
                ["Scope document captured", "Scope CID stored and ready for contract prompt context."],
                ["Claimant bundle uploaded", "Deliverables, timestamps, and screenshots are represented by immutable CIDs."],
                ["Respondent evidence pending", "Counter-evidence can be submitted before the response window closes."]
              ].map(([title, body], index) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-1 flex size-7 items-center justify-center rounded-full border-2 border-primary text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-primary">{title}</h3>
                    <p className="mt-1 text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="size-6 text-primary" />
                <h2 className="text-2xl font-extrabold">Response Window</h2>
              </div>
              <p className="mt-6 text-5xl font-extrabold text-primary">2d 10h</p>
              <p className="mt-2 text-muted-foreground">Default 72 hour window before evaluation can proceed.</p>
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
