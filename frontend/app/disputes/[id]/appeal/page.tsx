import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ContractStatus } from "@/components/contract-status";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function AppealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell active="Case History">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          eyebrow={<ContractStatus />}
          title="File an Appeal"
          description={`Submit stake-backed appeal evidence for case ${id} before the appeal window closes.`}
        />
        <Card className="mt-12 p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <label>
              <span className="font-semibold text-muted-foreground">Appeal Evidence CID *</span>
              <Input className="mt-3" placeholder="bafy..." />
            </label>
            <label>
              <span className="font-semibold text-muted-foreground">Appeal Stake *</span>
              <Input className="mt-3" placeholder="0.02" />
            </label>
          </div>
          <Textarea className="mt-8" placeholder="Describe the material error or new evidence supporting appeal..." />
          <div className="mt-8 flex justify-end">
            <Button>
              <ShieldAlert className="size-5" />
              Submit Appeal
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
