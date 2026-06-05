import { Award, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CredentialsPage() {
  return (
    <AppShell active="Juror Pool">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          title="Credentials"
          description="Soulbound arbitration credentials for resolved cases. Private evidence remains off-chain."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card className="paper-grid p-8">
            <Award className="size-8 text-primary" />
            <h2 className="mt-6 text-3xl font-extrabold text-primary">Disputr Resolution #90210</h2>
            <p className="mt-3 text-muted-foreground">Final ruling summary metadata stored by hash only.</p>
            <Button className="mt-8" variant="outline">
              View on Explorer <ExternalLink className="size-4" />
            </Button>
          </Card>
          <EmptyState
            title="No additional credentials"
            description="Resolved disputes will appear here after the credential contract is configured and minting completes."
          />
        </div>
      </div>
    </AppShell>
  );
}
