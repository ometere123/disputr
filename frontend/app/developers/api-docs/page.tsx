import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DISPUTR_API_URL } from "@/config/app";

const endpoints = [
  ["POST", "/v1/dispute", "write:disputes", "Open a new dispute with parties, evidence CID, optional scope CID, and native GEN stake."],
  ["GET", "/v1/dispute/:id", "read:verdicts", "Fetch dispute status, evidence hashes, and verdict data."],
  ["GET", "/v1/verdict/:id", "read:verdicts", "Read structured verdict, reasoning trace, confidence, and evidence weights."],
  ["POST", "/v1/appeal", "write:disputes", "Submit an appeal with native GEN stake and appeal evidence CID."],
  ["GET", "/v1/credentials/:address", "read:credentials", "List soulbound case credentials for a wallet."],
  ["POST", "/v1/webhooks", "write:webhooks", "Register an HTTPS endpoint for verdict.delivered events."]
];

export default function ApiDocsPage() {
  return (
    <AppShell active="Governance">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          title="API Documentation"
          description="B2B arbitration endpoints for escrow protocols, freelance marketplaces, bounty platforms, and NFT commission tools."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-6">
            <h2 className="text-2xl font-extrabold text-primary">Core Endpoints</h2>
            <p className="mt-3 font-mono text-sm text-muted-foreground">{DISPUTR_API_URL}</p>
            <div className="mt-6 space-y-4">
              {endpoints.map(([method, path, scope, description]) => (
                <div key={path} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={method === "GET" ? "muted" : "default"}>{method}</Badge>
                    <code className="font-mono text-sm font-semibold">{path}</code>
                    <Badge variant="warning">{scope}</Badge>
                  </div>
                  <p className="mt-3 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-extrabold text-primary">Webhook Security</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Disputr signs every webhook with HMAC-SHA256 over timestamp and body. Store the `whsec_` secret when it is
              created and reject stale timestamps to prevent replay.
            </p>
            <pre className="mt-8 overflow-x-auto rounded-xl bg-[#2a160f] p-5 text-sm text-[#f8eadf]">
{`Disputr-Timestamp: <unix_timestamp>
Disputr-Signature: v1=...

{
  "event": "verdict.delivered",
  "dispute_id": "<database_or_contract_id>",
  "verdict": "<claimant|respondent|split>",
  "confidence": "<0.00-1.00>",
  "release_to": "<wallet_address>"
}`}
            </pre>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
