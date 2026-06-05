import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";

export default function CredentialsPage() {
  return (
    <AppShell active="Juror Pool">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          title="Credentials"
          description="Soulbound arbitration credentials for resolved cases. Private evidence remains off-chain."
        />
        <div className="mt-8">
          <EmptyState
            title="No credentials yet"
            description="Resolved disputes will appear here after the credential contract is configured and minting completes."
          />
        </div>
      </div>
    </AppShell>
  );
}
