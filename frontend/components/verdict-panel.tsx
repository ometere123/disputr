import { Award, Brain, ExternalLink, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

export type VerdictPanelData = {
  id: string;
  confidence: number;
  summary: string;
  trace: Array<{
    label: string;
    detail: string;
    match: number;
  }>;
  weights: Array<{
    side: string;
    value: number;
    sources: Array<[string, string]>;
  }>;
  credentialExplorerHref?: string;
};

export function VerdictPanel({ verdict }: { verdict?: VerdictPanelData | null }) {
  if (!verdict) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.7fr]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#ead1c2] p-4 text-primary">
              <Scale className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">No Verdict Yet</h2>
              <p className="text-muted-foreground">A contract-backed verdict has not been delivered for this dispute.</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-border bg-[#fff4eb] p-6">
            <p className="text-sm font-bold uppercase text-primary">Ruling Summary</p>
            <p className="mt-3 text-muted-foreground">
              Once GenLayer evaluation commits a structured verdict on-chain, the reasoning summary will appear here.
            </p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Scale className="size-6 text-primary" />
              <h2 className="text-xl font-extrabold text-primary">Evidence Weights</h2>
            </div>
            <p className="mt-3 text-muted-foreground">Pending contract verdict data.</p>
          </Card>
          <Card className="paper-grid p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Award className="size-6 text-primary" />
                <h2 className="text-xl font-extrabold text-primary">Credential</h2>
              </div>
              <Badge>Pending</Badge>
            </div>
            <p className="mt-3 text-muted-foreground">
              The soulbound credential will appear after the credential contract mints it.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.7fr]">
      <Card className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#ead1c2] p-4 text-primary">
              <Scale className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">AI Verdict</h2>
              <p className="text-muted-foreground">Final Resolution</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-2xl font-extrabold text-[#1f8a5b]">{formatPercent(verdict.confidence)}</p>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Confidence Score</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-[#fff4eb] p-5">
          <p className="text-sm font-bold uppercase text-primary">Ruling Summary</p>
          <p className="mt-3 text-lg leading-8">{verdict.summary}</p>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-primary">
            <Brain className="size-5" />
            Reasoning Trace
          </div>
          <div className="mt-5 space-y-5 border-l-2 border-border pl-5">
            {verdict.trace.map((item) => (
              <div key={item.label} className="relative">
                <span className="absolute -left-[31px] top-1 size-6 rounded-full border-4 border-primary bg-card" />
                <h3 className="font-semibold">{item.label}</h3>
                <p className="mt-1 text-muted-foreground">
                  {item.detail} Match: {Math.round(item.match * 100)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Scale className="size-6 text-primary" />
            <h2 className="text-xl font-extrabold text-primary">Evidence Weights</h2>
          </div>
          <p className="mt-2 text-muted-foreground">Impact on final verdict.</p>
          <div className="mt-6 space-y-6">
            {verdict.weights.map((weight) => (
              <div key={weight.side}>
                <div className="flex items-center justify-between font-semibold">
                  <span>{weight.side}</span>
                  <span className={weight.side.startsWith("Claimant") ? "text-primary" : "text-[#a97928]"}>
                    {Math.round(weight.value * 100)}%
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#efd7ca]">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${weight.value * 100}%` }} />
                </div>
                <div className="mt-3 space-y-1">
                  {weight.sources.map(([source, confidence]) => (
                    <div key={source} className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{source}</span>
                      <span>{confidence}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="paper-grid p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Award className="size-6 text-primary" />
              <h2 className="text-xl font-extrabold text-primary">Credential</h2>
            </div>
            <Badge>Minted</Badge>
          </div>
          <p className="mt-3 text-muted-foreground">Soulbound arbitration NFT issued.</p>
          {verdict.credentialExplorerHref ? (
            <Button asChild className="mt-6 w-full" variant="outline">
              <a href={verdict.credentialExplorerHref} target="_blank" rel="noreferrer">
                View on Explorer <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
