"use client";

import { ArrowRight, CheckCircle2, FileUp, Info, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { isAddress, parseEther, type Address } from "viem";
import { useAccount } from "wagmi";
import { ContractStatus } from "@/components/contract-status";
import { EvidenceBundleBuilder } from "@/components/evidence-bundle-builder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { contractStatus } from "@/config/genlayer";
import { openDisputeOnChain } from "@/lib/genlayer-client";
import { cn } from "@/lib/utils";

const steps = ["Details", "Evidence", "Stake"];

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

export function DisputeForm() {
  const router = useRouter();
  const { address } = useAccount();
  const [step, setStep] = React.useState(0);
  const [respondent, setRespondent] = React.useState("");
  const [scopeCid, setScopeCid] = React.useState("");
  const [claimantCid, setClaimantCid] = React.useState("");
  const [stake, setStake] = React.useState("0.01");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canOpen =
    contractStatus.disputr &&
    Boolean(address) &&
    isAddress(respondent) &&
    claimantCid.trim().length >= 10 &&
    stake.trim().length > 0 &&
    !isSubmitting;

  async function handleOpenDispute() {
    setError("");
    setStatus("");

    if (!address) {
      setError("Connect a wallet before opening a dispute.");
      return;
    }

    if (!contractStatus.disputr) {
      setError("Disputr contract is not configured.");
      return;
    }

    if (!isAddress(respondent)) {
      setError("Respondent wallet must be a valid EVM address.");
      return;
    }

    if (claimantCid.trim().length < 10) {
      setError("Claimant evidence CID is required.");
      return;
    }

    if (claimantCid.trim().length > 120 || (scopeCid.trim() && (scopeCid.trim().length < 10 || scopeCid.trim().length > 120))) {
      setError("Evidence CIDs must be between 10 and 120 characters.");
      return;
    }

    let stakeWei: bigint;
    try {
      stakeWei = parseEther(stake);
    } catch {
      setError("Stake must be a valid GEN amount.");
      return;
    }

    if (stakeWei <= 0n) {
      setError("Stake must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      setStatus("Submitting dispute transaction to GenLayer StudioNet...");
      const result = await openDisputeOnChain({
        account: address,
        claimant: address,
        respondent: respondent as Address,
        claimantCid: claimantCid.trim(),
        scopeCid: scopeCid.trim(),
        stakeWei
      });
      const txLabel = resultLabel(result);
      setStatus(`Transaction submitted: ${txLabel}. Saving the dispute to your dashboard...`);
      const response = await fetch("/api/me/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondent,
          claimantCid: claimantCid.trim(),
          scopeCid: scopeCid.trim(),
          stakeGen: stake,
          onChainTx: txLabel
        })
      });

      if (!response.ok) {
        setStatus(`Transaction submitted: ${txLabel}. Sign in with your wallet to index it in the dashboard.`);
        return;
      }

      const data = (await response.json()) as { dispute: { id: string } };
      router.push(`/disputes/${data.dispute.id}`);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Dispute transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8">
        <div className="grid grid-cols-3 gap-4 text-sm md:text-base">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                "flex items-center gap-3 rounded-full px-3 py-2 text-left text-muted-foreground",
                step === index && "font-semibold text-foreground"
              )}
            >
              <span>{index + 1}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {step === 0 ? <DetailsStep claimant={address ?? ""} respondent={respondent} onRespondentChange={setRespondent} /> : null}
          {step === 1 ? (
            <EvidenceStep
              claimantCid={claimantCid}
              scopeCid={scopeCid}
              onClaimantCidChange={setClaimantCid}
              onScopeCidChange={setScopeCid}
            />
          ) : null}
          {step === 2 ? <StakeStep stake={stake} onStakeChange={setStake} /> : null}
        </div>

        {error ? <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
        {status ? (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em]">Arbitration status</p>
            <p className="mt-3 flex items-start gap-2 text-sm font-semibold">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              {status}
            </p>
            <p className="mt-2 pl-6 text-xs leading-5 text-green-800">
              GenLayer consensus and dashboard indexing can take a few minutes. The case will appear once the transaction
              and database record are both available.
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-4 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || isSubmitting}>
            Cancel
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next: {steps[step + 1]} <ArrowRight className="size-5" />
            </Button>
          ) : (
            <Button disabled={!canOpen} onClick={() => void handleOpenDispute()}>
              {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
              Open Dispute
            </Button>
          )}
        </div>
      </Card>

      <div className="rounded-[18px] border border-[#ecdca7] bg-[#fbefd6] p-5 text-primary">
        <div className="flex gap-4">
          <Info className="mt-1 size-6 shrink-0" />
          <div>
            <h3 className="font-bold">Arbitration Fees</h3>
            <p className="mt-2 leading-7 text-[#6d5134]">
              Opening a dispute sends the native stake to the deployed Disputr contract. The contract stores the claimant,
              respondent, claimant evidence CID, optional scope CID, response window, and appeal window on-chain.
            </p>
            <div className="mt-4">
              <ContractStatus />
            </div>
            {!contractStatus.disputr ? (
              <p className="mt-4 rounded-xl border border-[#e2c98a] bg-[#fff7df] p-4 text-sm font-semibold text-[#6d5134]">
                Add NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS before sending transactions. The form remains usable for reviewing
                required fields while contracts are being configured.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailsStep({
  claimant,
  respondent,
  onRespondentChange
}: {
  claimant: string;
  respondent: string;
  onRespondentChange: (value: string) => void;
}) {
  return (
    <div className="space-y-7">
      <section>
        <h2 className="border-b border-border pb-3 text-xl font-extrabold">Involved Parties</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <label>
            <span className="font-semibold text-muted-foreground">Claimant Wallet *</span>
            <Input className="mt-3" disabled value={claimant || "Connect wallet"} />
            <span className="mt-2 block text-sm text-muted-foreground">Your connected wallet is used as the claimant.</span>
          </label>
          <label>
            <span className="font-semibold text-muted-foreground">Respondent Wallet *</span>
            <Input className="mt-3" placeholder="0x..." value={respondent} onChange={(event) => onRespondentChange(event.target.value)} />
            <span className="mt-2 block text-sm text-muted-foreground">The counterparty address passed to open_dispute.</span>
          </label>
        </div>
      </section>
    </div>
  );
}

function EvidenceStep({
  claimantCid,
  scopeCid,
  onClaimantCidChange,
  onScopeCidChange
}: {
  claimantCid: string;
  scopeCid: string;
  onClaimantCidChange: (value: string) => void;
  onScopeCidChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="border-b border-border pb-3 text-xl font-extrabold">Evidence Bundle</h2>
        <div className="mt-6 space-y-5">
          <EvidenceBundleBuilder side="claimant" cid={claimantCid} onCidChange={onClaimantCidChange} />
          <label className="block">
            <span className="font-semibold text-muted-foreground">Optional separate scope CID</span>
            <Input className="mt-3" placeholder="bafy..." value={scopeCid} onChange={(event) => onScopeCidChange(event.target.value)} />
            <span className="mt-2 block text-sm text-muted-foreground">
              Use this only if the scope document already has its own CID. The guided bundle can include scope text too.
            </span>
          </label>
        </div>
      </section>
      <div className="rounded-xl border border-dashed border-border bg-[#ead9ca] p-6 text-center">
        <FileUp className="mx-auto size-10 text-primary" />
        <p className="mt-4 font-semibold text-muted-foreground">The contract receives the CID, not the raw evidence text.</p>
      </div>
    </div>
  );
}

function StakeStep({ stake, onStakeChange }: { stake: string; onStakeChange: (value: string) => void }) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="border-b border-border pb-3 text-xl font-extrabold">Stake</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <label>
            <span className="font-semibold text-muted-foreground">Native GEN Stake *</span>
            <Input className="mt-3" inputMode="decimal" placeholder="0.01" value={stake} onChange={(event) => onStakeChange(event.target.value)} />
            <span className="mt-2 block text-sm text-muted-foreground">Sent as payable value to open_dispute.</span>
          </label>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold uppercase text-muted-foreground">Appeal Window</p>
            <p className="mt-3 text-2xl font-extrabold text-primary">72h</p>
            <p className="mt-2 text-sm text-muted-foreground">The deployed contract defaults to 72h unless the owner updates set_windows.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
