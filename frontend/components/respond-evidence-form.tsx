"use client";

import { Loader2, UploadCloud } from "lucide-react";
import * as React from "react";
import { useAccount } from "wagmi";
import { ContractStatus } from "@/components/contract-status";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { contractStatus } from "@/config/genlayer";
import { submitResponseOnChain } from "@/lib/genlayer-client";

function resultLabel(result: unknown) {
  if (typeof result === "string") {
    return result;
  }

  if (result && typeof result === "object") {
    const record = result as Record<string, unknown>;
    const hash = record.transactionHash ?? record.hash ?? record.transaction_hash;
    if (typeof hash === "string") {
      return hash;
    }
  }

  return "Transaction submitted";
}

export function RespondEvidenceForm({ disputeId }: { disputeId: string }) {
  const { address } = useAccount();
  const [respondentCid, setRespondentCid] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canSubmit = contractStatus.disputr && Boolean(address) && respondentCid.trim().length >= 10 && !isSubmitting;

  async function handleSubmit() {
    setError("");
    setStatus("");

    if (!address) {
      setError("Connect the respondent wallet before submitting counter-evidence.");
      return;
    }

    if (!contractStatus.disputr) {
      setError("Disputr contract is not configured.");
      return;
    }

    if (respondentCid.trim().length < 10 || respondentCid.trim().length > 120) {
      setError("Respondent evidence CID must be between 10 and 120 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitResponseOnChain({
        account: address,
        disputeId,
        respondentCid: respondentCid.trim()
      });
      const txLabel = resultLabel(result);
      const response = await fetch(`/api/me/disputes/${disputeId}/response`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondentCid: respondentCid.trim(),
          onChainTx: txLabel
        })
      });

      if (!response.ok) {
        setStatus(`Response transaction submitted: ${txLabel}. Sign in with the respondent wallet to save dashboard status.`);
        return;
      }

      setStatus(`Response saved: ${txLabel}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Response transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mt-8 p-6">
      <div className="mb-6">
        <ContractStatus />
      </div>
      <label>
        <span className="font-semibold text-muted-foreground">Respondent Evidence CID *</span>
        <Input className="mt-3" placeholder="bafy..." value={respondentCid} onChange={(event) => setRespondentCid(event.target.value)} />
        <span className="mt-2 block text-sm text-muted-foreground">Passed directly to submit_response as respondent_cid.</span>
      </label>
      <div className="mt-6 rounded-xl border border-dashed border-border bg-[#ead9ca] p-8 text-center">
        <UploadCloud className="mx-auto size-10 text-primary" />
        <p className="mt-4 font-semibold text-muted-foreground">Upload counter-evidence to IPFS, then paste the returned CID here</p>
      </div>
      {error ? <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {status ? (
        <p className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          {status}
        </p>
      ) : null}
      <div className="mt-6 flex justify-end">
        <Button disabled={!canSubmit} onClick={() => void handleSubmit()}>
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
          Submit Response
        </Button>
      </div>
    </Card>
  );
}
