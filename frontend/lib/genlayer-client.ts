"use client";

import { createClient } from "genlayer-js";
import type { Address } from "viem";
import { GENLAYER_RPC_URL, contractAddresses, contractStatus } from "@/config/genlayer";
import { genLayerStudioNet } from "@/lib/wagmi";

type ClientConfig = NonNullable<Parameters<typeof createClient>[0]>;

export type ContractCallState =
  | {
      configured: true;
      address: Address;
    }
  | {
      configured: false;
      message: string;
    };

export type DisputrVerdict = {
  winner: "claimant" | "respondent" | "split" | "";
  splitRatioBps: number;
  confidenceBps: number;
  reasoning: string;
  claimantWeightBps: number;
  respondentWeightBps: number;
  reasoningTrace: string;
};

export type DisputrDispute = {
  id: string;
  claimant: Address | string;
  respondent: Address | string;
  claimantCid: string;
  respondentCid: string;
  scopeCid: string;
  status: "pending_response" | "ready_for_evaluation" | "resolved" | "appealed" | "settled" | string;
  stakeWei: string;
  createdAt: number;
  responseDeadline: number;
  appealDeadline: number;
  settled: boolean;
  settledAt: number;
  claimantPaidWei: string;
  respondentPaidWei: string;
  verdict: DisputrVerdict;
};

export type OpenDisputeInput = {
  account: Address;
  claimant: Address;
  respondent: Address;
  claimantCid: string;
  scopeCid?: string;
  stakeWei: bigint;
};

export type SubmitResponseInput = {
  account: Address;
  disputeId: string | bigint | number;
  respondentCid: string;
};

export type AppealInput = {
  account: Address;
  disputeId: string | bigint | number;
  appealCid: string;
  stakeWei: bigint;
};

function getAddress(name: keyof typeof contractAddresses, label: string): Address {
  const address = contractAddresses[name];
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`${label} contract is not configured`);
  }
  return address as Address;
}

function createBrowserClient(account?: Address) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Injected wallet provider not available");
  }

  return createClient({
    chain: genLayerStudioNet,
    provider: window.ethereum as ClientConfig["provider"],
    account
  });
}

function createReadClient() {
  return createClient({
    chain: genLayerStudioNet,
    endpoint: GENLAYER_RPC_URL
  });
}

function toDisputeId(value: string | bigint | number) {
  const disputeId = BigInt(value);
  if (disputeId <= 0n) {
    throw new Error("Dispute id must be greater than zero");
  }
  return disputeId;
}

function numberFrom(value: unknown) {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  return 0;
}

function stringFrom(value: unknown) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function recordFrom(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeVerdict(value: unknown): DisputrVerdict {
  const verdict = recordFrom(value);
  return {
    winner: stringFrom(verdict.winner) as DisputrVerdict["winner"],
    splitRatioBps: numberFrom(verdict.split_ratio_bps),
    confidenceBps: numberFrom(verdict.confidence_bps),
    reasoning: stringFrom(verdict.reasoning),
    claimantWeightBps: numberFrom(verdict.claimant_weight_bps),
    respondentWeightBps: numberFrom(verdict.respondent_weight_bps),
    reasoningTrace: stringFrom(verdict.reasoning_trace)
  };
}

export function getDisputrContractState(): ContractCallState {
  if (!contractStatus.disputr) {
    return {
      configured: false,
      message: "Disputr contract not configured"
    };
  }

  return {
    configured: true,
    address: contractAddresses.disputr as Address
  };
}

export function getCredentialContractState(): ContractCallState {
  if (!contractStatus.credentialNft) {
    return {
      configured: false,
      message: "Credential contract not configured"
    };
  }

  return {
    configured: true,
    address: contractAddresses.credentialNft as Address
  };
}

export function getAppealContractState(): ContractCallState {
  if (!contractStatus.appealOracle) {
    return {
      configured: false,
      message: "Appeal oracle contract not configured"
    };
  }

  return {
    configured: true,
    address: contractAddresses.appealOracle as Address
  };
}

export async function openDisputeOnChain(input: OpenDisputeInput) {
  const client = createBrowserClient(input.account);
  return client.writeContract({
    address: getAddress("disputr", "Disputr"),
    functionName: "open_dispute",
    args: [input.claimant, input.respondent, input.claimantCid, input.scopeCid ?? ""],
    value: input.stakeWei
  });
}

export async function submitResponseOnChain(input: SubmitResponseInput) {
  const client = createBrowserClient(input.account);
  return client.writeContract({
    address: getAddress("disputr", "Disputr"),
    functionName: "submit_response",
    args: [toDisputeId(input.disputeId), input.respondentCid],
    value: 0n
  });
}

export async function evaluateDisputeOnChain(account: Address, disputeId: string | bigint | number) {
  const client = createBrowserClient(account);
  return client.writeContract({
    address: getAddress("disputr", "Disputr"),
    functionName: "evaluate_dispute",
    args: [toDisputeId(disputeId)],
    value: 0n
  });
}

export async function fileAppealOnChain(input: AppealInput) {
  const client = createBrowserClient(input.account);
  return client.writeContract({
    address: getAddress("disputr", "Disputr"),
    functionName: "file_appeal",
    args: [toDisputeId(input.disputeId), input.appealCid],
    value: input.stakeWei
  });
}

export async function releaseEscrowOnChain(account: Address, disputeId: string | bigint | number) {
  const client = createBrowserClient(account);
  return client.writeContract({
    address: getAddress("disputr", "Disputr"),
    functionName: "release_escrow",
    args: [toDisputeId(disputeId)],
    value: 0n
  });
}

export async function readDisputrDispute(disputeId: string | bigint | number): Promise<DisputrDispute> {
  const client = createReadClient();
  const raw = await client.readContract({
    address: getAddress("disputr", "Disputr"),
    functionName: "get_dispute",
    args: [toDisputeId(disputeId)],
    jsonSafeReturn: true
  });
  const dispute = recordFrom(raw);

  return {
    id: stringFrom(dispute.id),
    claimant: stringFrom(dispute.claimant),
    respondent: stringFrom(dispute.respondent),
    claimantCid: stringFrom(dispute.claimant_cid),
    respondentCid: stringFrom(dispute.respondent_cid),
    scopeCid: stringFrom(dispute.scope_cid),
    status: stringFrom(dispute.status),
    stakeWei: stringFrom(dispute.stake),
    createdAt: numberFrom(dispute.created_at),
    responseDeadline: numberFrom(dispute.response_deadline),
    appealDeadline: numberFrom(dispute.appeal_deadline),
    settled: Boolean(dispute.settled),
    settledAt: numberFrom(dispute.settled_at),
    claimantPaidWei: stringFrom(dispute.claimant_paid),
    respondentPaidWei: stringFrom(dispute.respondent_paid),
    verdict: normalizeVerdict(dispute.verdict)
  };
}

export async function readTotalDisputes() {
  const client = createReadClient();
  const raw = await client.readContract({
    address: getAddress("disputr", "Disputr"),
    functionName: "total_disputes",
    jsonSafeReturn: true
  });
  return stringFrom(raw);
}

export async function readCredentialIds(wallet: Address) {
  const client = createReadClient();
  const raw = await client.readContract({
    address: getAddress("credentialNft", "Credential"),
    functionName: "credentials_of",
    args: [wallet],
    jsonSafeReturn: true
  });
  return Array.isArray(raw) ? raw.map(stringFrom) : [];
}

export async function readLatestAppealForDispute(disputeId: string | bigint | number) {
  const client = createReadClient();
  const raw = await client.readContract({
    address: getAddress("appealOracle", "Appeal oracle"),
    functionName: "get_latest_appeal_for_dispute",
    args: [toDisputeId(disputeId)],
    jsonSafeReturn: true
  });
  return stringFrom(raw);
}
