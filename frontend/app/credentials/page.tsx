import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getUserCredentials } from "@/lib/server/dispute-data";
import { compactAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CredentialsPage() {
  const credentials = await getUserCredentials();

  return (
    <AppShell active="Credentials">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          title="Credentials"
          description="Soulbound arbitration credentials for resolved cases. Private evidence remains off-chain."
        />
        <div className="mt-8">
          {credentials.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {credentials.map((credential) => (
                <Card key={credential.id} className="paper-grid p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold text-primary">Credential #{credential.tokenId}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">Dispute {credential.disputeId}</p>
                    </div>
                    <Badge variant="success">Minted</Badge>
                  </div>
                  <div className="mt-6 space-y-3 text-sm">
                    <CredentialRow label="Wallet" value={compactAddress(credential.walletAddress)} />
                    <CredentialRow label="Metadata" value={credential.metadataHash} />
                    <CredentialRow label="Transaction" value={credential.onChainTx ?? "Awaiting indexer tx"} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No credentials yet"
              description="Resolved disputes will appear here after the credential contract is configured and minting completes."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-bold uppercase text-primary">{label}</p>
      <p className="mt-1 break-all text-muted-foreground">{value}</p>
    </div>
  );
}
