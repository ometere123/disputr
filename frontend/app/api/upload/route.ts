import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/server/user";

export const runtime = "nodejs";

const PINATA_PIN_FILE_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

const evidenceSchema = z.object({
  side: z.enum(["claimant", "respondent", "appeal"]).default("claimant"),
  scope: z.string().trim().max(8000).default(""),
  claimantEvidence: z.string().trim().max(12000).default(""),
  respondentEvidence: z.string().trim().max(12000).default(""),
  appealEvidence: z.string().trim().max(12000).default(""),
  deliverables: z.array(z.string().trim().max(500)).max(30).default([]),
  timestamps: z.array(z.string().trim().max(500)).max(60).default([]),
  communications: z.string().trim().max(8000).default(""),
  requestedOutcome: z.string().trim().max(4000).default("")
}).refine(
  (value) => Boolean(value.claimantEvidence || value.respondentEvidence || value.appealEvidence || value.scope),
  "Evidence text is required."
);

type PinataUploadResponse = {
  IpfsHash?: string;
  cid?: string;
  data?: {
    cid?: string;
  };
};

function cidFromPinataResponse(data: PinataUploadResponse) {
  return data.IpfsHash ?? data.cid ?? data.data?.cid;
}

function gatewayUrlForCid(cid: string) {
  const gateway = process.env.PINATA_GATEWAY?.trim();
  if (!gateway) {
    return undefined;
  }

  const normalizedGateway = gateway.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${normalizedGateway}/ipfs/${cid}`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json({ error: "ipfs_not_configured", message: "PINATA_JWT is required." }, { status: 503 });
  }

  const parsed = evidenceSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 });
  }

  const bundle = {
    schema: "disputr.evidence.bundle.v1",
    generated_at: new Date().toISOString(),
    generated_by: user.walletAddress ?? user.email ?? user.id,
    ...parsed.data
  };
  const file = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const formData = new FormData();
  const fileName = `disputr-${parsed.data.side}-evidence-bundle.json`;
  formData.append("file", file, fileName);
  formData.append("pinataMetadata", JSON.stringify({ name: fileName }));

  const response = await fetch(PINATA_PIN_FILE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`
    },
    body: formData
  });

  if (!response.ok) {
    return NextResponse.json({ error: "ipfs_upload_failed" }, { status: 502 });
  }

  const data = (await response.json()) as PinataUploadResponse;
  const cid = cidFromPinataResponse(data);
  if (!cid) {
    return NextResponse.json({ error: "ipfs_upload_failed" }, { status: 502 });
  }

  return NextResponse.json({ cid, gatewayUrl: gatewayUrlForCid(cid) });
}
