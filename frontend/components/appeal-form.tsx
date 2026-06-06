"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import * as React from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { ContractStatus } from "@/components/contract-status";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { contractStatus } from "@/config/genlayer";
import { fileAppealOnChain } from "@/lib/genlayer-client";

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

export function AppealForm({ disputeId }: { disputeId: string }) {
  const { address } = useAccount();
  const [appealCid, setAppealCid] = React.useState("");
  const [stake, setStake] = React.useState("0.01");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canSubmit = contractStatus.disputr && Boolean(address) && appealCid.trim().length >= 10 && stake.trim().length > 0 && !isSubmitting;

  async function handleSubmit() {
    setError("");
    setStatus("");

    if (!address) {
      setError("Connect the appellant wallet before filing an appeal.");
      return;
    }

    if (!contractStatus.disputr) {
      setError("Disputr contract is not configured.");
      return;
    }

    if (appealCid.trim().length < 10 || appealCid.trim().length > 120) {
      setError("Appeal evidence CID must be between 10 and 120 characters.");
      return;
    }

    let stakeWei: bigint;
    try {
      stakeWei = parseEther(stake);
    } catch {
      setError("Appeal stake must be a valid GEN amount.");
      return;
    }

    if (stakeWei <= 0n) {
      setError("Appeal stake must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await fileAppealOnChain({
        account: address,
        disputeId,
        appealCid: appealCid.trim(),
        stakeWei
      });
      const txLabel = resultLabel(result);
      const response = await fetch(`/api/me/disputes/${disputeId}/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appealCid: appealCid.trim(),
          stakeGen: stake,
          onChainTx: txLabel
        })
      });

      if (!response.ok) {
        setStatus(`Appeal transaction submitted: ${txLabel}. Sign in with the appellant wallet to save dashboard status.`);
        return;
      }

      setStatus(`Appeal saved: ${txLabel}`);
    } catch (appealError) {
      setError(appealError instanceof Error ? appealError.message : "Appeal transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mt-8 p-6">
      <div className="mb-6">
        <ContractStatus />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <label>
          <span className="font-semibold text-muted-foreground">Appeal Evidence CID *</span>
          <Input className="mt-3" placeholder="bafy..." value={appealCid} onChange={(event) => setAppealCid(event.target.value)} />
          <span className="mt-2 block text-sm text-muted-foreground">Passed directly to file_appeal as appeal_cid.</span>
        </label>
        <label>
          <span className="font-semibold text-muted-foreground">Native GEN Appeal Stake *</span>
          <Input className="mt-3" inputMode="decimal" placeholder="0.01" value={stake} onChange={(event) => setStake(event.target.value)} />
          <span className="mt-2 block text-sm text-muted-foreground">Sent as payable value to file_appeal.</span>
        </label>
      </div>
      {error ? <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {status ? (
        <p className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          {status}
        </p>
      ) : null}
      <div className="mt-6 flex justify-end">
        <Button disabled={!canSubmit} onClick={() => void handleSubmit()}>
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <ShieldAlert className="size-5" />}
          Submit Appeal
        </Button>
      </div>
    </Card>
  );
}
