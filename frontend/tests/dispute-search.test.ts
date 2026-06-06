import type { Dispute } from "@disputr/db";
import { describe, expect, it } from "vitest";
import { filterDisputes } from "../lib/dispute-search";

const baseDispute: Dispute = {
  id: "dsp_alpha123",
  escrowAddress: "0x1111111111111111111111111111111111111111",
  claimant: "0x2222222222222222222222222222222222222222",
  respondent: "0x3333333333333333333333333333333333333333",
  claimantCid: "bafyclaimantalpha",
  respondentCid: null,
  scopeDocHash: "bafyscopealpha",
  status: "pending_response",
  stakeGen: "12.5",
  onChainDisputeId: "42",
  onChainTx: "0xtxalpha",
  appealWindowExpires: null,
  createdAt: new Date("2026-06-06T00:00:00Z"),
  updatedAt: new Date("2026-06-06T00:00:00Z")
};

describe("filterDisputes", () => {
  it("matches case IDs without the display hash prefix", () => {
    expect(filterDisputes([baseDispute], "#dsp_alpha").map((dispute) => dispute.id)).toEqual(["dsp_alpha123"]);
  });

  it("matches human status labels", () => {
    expect(filterDisputes([baseDispute], "Pending Response")).toHaveLength(1);
  });

  it("matches evidence CIDs and wallet addresses", () => {
    expect(filterDisputes([baseDispute], "bafyclaimant")).toHaveLength(1);
    expect(filterDisputes([baseDispute], "3333333333333333333333333333333333333333")).toHaveLength(1);
  });
});
