import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const PINATA_PIN_FILE_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

const evidenceSchema = z.object({
  scope: z.string().min(1),
  claimantEvidence: z.string().min(1),
  deliverables: z.array(z.string()).default([]),
  timestamps: z.array(z.string()).default([])
});

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
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json({ error: "ipfs_not_configured", message: "PINATA_JWT is required." }, { status: 503 });
  }

  const parsed = evidenceSchema.parse(await request.json());
  const file = new Blob([JSON.stringify(parsed)], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", file, "disputr-evidence-bundle.json");
  formData.append("pinataMetadata", JSON.stringify({ name: "disputr-evidence-bundle.json" }));

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
