"use client";

import { CheckCircle2, FileJson2, Loader2, UploadCloud } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type EvidenceSide = "claimant" | "respondent" | "appeal";

const sideLabels: Record<EvidenceSide, { title: string; evidenceLabel: string; outcomeLabel: string }> = {
  claimant: {
    title: "Claimant evidence bundle",
    evidenceLabel: "What happened? What evidence supports your claim?",
    outcomeLabel: "Requested outcome"
  },
  respondent: {
    title: "Respondent counter-evidence bundle",
    evidenceLabel: "What is your response? What evidence supports it?",
    outcomeLabel: "Requested outcome"
  },
  appeal: {
    title: "Appeal evidence bundle",
    evidenceLabel: "Why should the verdict be reviewed?",
    outcomeLabel: "Requested appeal result"
  }
};

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function EvidenceBundleBuilder({
  side,
  cid,
  onCidChange,
  defaultScope = ""
}: {
  side: EvidenceSide;
  cid: string;
  onCidChange: (cid: string) => void;
  defaultScope?: string;
}) {
  const [mode, setMode] = React.useState<"guided" | "cid">("guided");
  const [scope, setScope] = React.useState(defaultScope);
  const [evidence, setEvidence] = React.useState("");
  const [deliverables, setDeliverables] = React.useState("");
  const [timestamps, setTimestamps] = React.useState("");
  const [communications, setCommunications] = React.useState("");
  const [requestedOutcome, setRequestedOutcome] = React.useState("");
  const [gatewayUrl, setGatewayUrl] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  const labels = sideLabels[side];
  const bundle = React.useMemo(
    () => ({
      side,
      scope,
      claimantEvidence: side === "claimant" ? evidence : "",
      respondentEvidence: side === "respondent" ? evidence : "",
      appealEvidence: side === "appeal" ? evidence : "",
      deliverables: lines(deliverables),
      timestamps: lines(timestamps),
      communications,
      requestedOutcome
    }),
    [communications, deliverables, evidence, requestedOutcome, scope, side, timestamps]
  );

  async function uploadBundle() {
    setError("");
    setStatus("");
    setGatewayUrl("");

    if (!evidence.trim() && !scope.trim()) {
      setError("Add evidence text before generating a CID.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundle)
      });
      const data = (await response.json().catch(() => ({}))) as { cid?: string; gatewayUrl?: string; error?: string };

      if (response.status === 401) {
        setError("Sign in before uploading evidence.");
        return;
      }

      if (!response.ok || !data.cid) {
        setError(data.error === "ipfs_not_configured" ? "Pinata is not configured yet." : "Could not upload evidence bundle.");
        return;
      }

      onCidChange(data.cid);
      setGatewayUrl(data.gatewayUrl ?? "");
      setStatus("Evidence bundle uploaded. CID is ready for the contract.");
      setMode("cid");
    } catch {
      setError("Could not upload evidence bundle.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="border-dashed p-5 shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-primary">{labels.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Write plain text and Disputr will package it into JSON, upload it to IPFS, and use the CID on-chain.
          </p>
        </div>
        <div className="flex rounded-full border border-border bg-card p-1 text-sm font-semibold">
          {(["guided", "cid"] as const).map((item) => (
            <button
              key={item}
              className={cn("rounded-full px-4 py-2 text-muted-foreground", mode === item && "bg-[#ead1c2] text-primary")}
              onClick={() => setMode(item)}
              type="button"
            >
              {item === "guided" ? "Write evidence" : "Use CID"}
            </button>
          ))}
        </div>
      </div>

      {mode === "guided" ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <div className="space-y-4">
            <label>
              <span className="text-sm font-semibold text-muted-foreground">Scope or agreement summary</span>
              <Textarea
                className="mt-2 min-h-24"
                placeholder="Paste the agreed scope, milestone terms, or job brief summary."
                value={scope}
                onChange={(event) => setScope(event.target.value)}
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-muted-foreground">{labels.evidenceLabel}</span>
              <Textarea
                className="mt-2 min-h-32"
                placeholder="Explain the facts, attach links, and reference screenshots or files by name."
                value={evidence}
                onChange={(event) => setEvidence(event.target.value)}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-muted-foreground">Deliverables</span>
                <Textarea
                  className="mt-2 min-h-24"
                  placeholder="One deliverable per line"
                  value={deliverables}
                  onChange={(event) => setDeliverables(event.target.value)}
                />
              </label>
              <label>
                <span className="text-sm font-semibold text-muted-foreground">Timeline</span>
                <Textarea
                  className="mt-2 min-h-24"
                  placeholder="One timestamp or event per line"
                  value={timestamps}
                  onChange={(event) => setTimestamps(event.target.value)}
                />
              </label>
            </div>
            <label>
              <span className="text-sm font-semibold text-muted-foreground">Communication notes</span>
              <Textarea
                className="mt-2 min-h-24"
                placeholder="Summarize relevant chat, email, or screenshot context."
                value={communications}
                onChange={(event) => setCommunications(event.target.value)}
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-muted-foreground">{labels.outcomeLabel}</span>
              <Input
                className="mt-2"
                placeholder="Release funds, refund, split, or review verdict."
                value={requestedOutcome}
                onChange={(event) => setRequestedOutcome(event.target.value)}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-[#25130d] p-4 text-[#fff3ea]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ead1c2]">
                <FileJson2 className="size-4" />
                Bundle preview
              </div>
              <pre className="mt-3 max-h-72 overflow-auto text-xs leading-5">
                <code>{JSON.stringify(bundle, null, 2)}</code>
              </pre>
            </div>
            <div className="rounded-xl border border-[#ecdca7] bg-[#fbefd6] p-4 text-sm leading-6 text-[#6d5134]">
              Raw evidence is uploaded off-chain. Only the CID is passed to the contract. Avoid private keys, passwords,
              and sensitive personal data unless you intentionally want that evidence stored on IPFS.
            </div>
            <Button className="w-full" disabled={isUploading} onClick={() => void uploadBundle()}>
              {isUploading ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />}
              Generate CID
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <label>
            <span className="text-sm font-semibold text-muted-foreground">Evidence CID</span>
            <Input className="mt-2 font-mono" placeholder="bafy..." value={cid} onChange={(event) => onCidChange(event.target.value)} />
          </label>
          <p className="mt-2 text-sm text-muted-foreground">
            Advanced users can paste a CID they generated elsewhere. Everyone else can use the guided text upload.
          </p>
        </div>
      )}

      {cid ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#d7f0a2] bg-[#f4ffd6] p-3 text-sm font-semibold text-[#176d44]">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          CID ready: <span className="min-w-0 truncate font-mono">{cid}</span>
        </p>
      ) : null}
      {gatewayUrl ? (
        <a className="mt-2 inline-block text-sm font-semibold text-primary" href={gatewayUrl} target="_blank" rel="noreferrer">
          View uploaded bundle
        </a>
      ) : null}
      {status ? <p className="mt-4 text-sm font-semibold text-[#176d44]">{status}</p> : null}
      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
    </Card>
  );
}
