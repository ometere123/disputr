import { Award, Brain, ExternalLink, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import { verdict } from "@/lib/demo-data";

export function VerdictPanel() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr]">
      <Card className="p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#ead1c2] p-5 text-primary">
              <GavelIcon />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold">AI Verdict</h2>
              <p className="text-muted-foreground">Final Resolution</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-3xl font-extrabold text-[#1f8a5b]">{formatPercent(verdict.confidence)}</p>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Confidence Score</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-[#fff4eb] p-6">
          <p className="text-sm font-bold uppercase text-primary">Ruling Summary</p>
          <p className="mt-4 text-xl leading-9">
            {verdict.summary.split("Claimant").map((part, index, arr) => (
              <span key={`${part}-${index}`}>
                {part}
                {index < arr.length - 1 ? <strong>Claimant</strong> : null}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-8">
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

      <div className="space-y-8">
        <Card className="p-7">
          <div className="flex items-center gap-3">
            <Scale className="size-7 text-primary" />
            <h2 className="text-2xl font-extrabold text-primary">Evidence Weights</h2>
          </div>
          <p className="mt-2 text-muted-foreground">Impact on final verdict.</p>
          <div className="mt-8 space-y-8">
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

        <Card className="paper-grid p-7">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Award className="size-7 text-primary" />
              <h2 className="text-2xl font-extrabold text-primary">Credential</h2>
            </div>
            <Badge>Minted</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">Soulbound arbitration NFT issued.</p>
          <div className="mt-6 rounded-xl bg-[radial-gradient(circle_at_60%_30%,#c87338,#3b1b10_62%,#1d120e)] p-6 text-primary-foreground">
            <div className="flex h-40 items-center justify-center">
              <div className="size-24 rounded-full border-[18px] border-[#bf6b3b] shadow-[0_0_50px_rgba(255,145,81,0.48)]" />
            </div>
            <p className="font-extrabold">Disputr Resolution {verdict.id}</p>
            <p className="mt-1 text-sm text-[#ead1c2]">Soulbound case credential</p>
          </div>
          <Button className="mt-6 w-full" variant="outline">
            View on Explorer <ExternalLink className="size-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
}

function GavelIcon() {
  return <Scale className="size-8" />;
}
