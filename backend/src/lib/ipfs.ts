import { env, type RuntimeEnv } from "../env.js";

const PINATA_PIN_FILE_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

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

export function evidenceGatewayUrl(cid: string, runtimeEnv: RuntimeEnv = env) {
  const gateway = runtimeEnv.PINATA_GATEWAY?.trim();
  if (!gateway) {
    return undefined;
  }

  const normalizedGateway = gateway.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${normalizedGateway}/ipfs/${cid}`;
}

export async function uploadEvidenceBundle(payload: Blob | string, name = "evidence-bundle.json", runtimeEnv: RuntimeEnv = env) {
  if (!runtimeEnv.PINATA_JWT) {
    throw new Error("PINATA_JWT is required for IPFS uploads");
  }

  const file = payload instanceof Blob ? payload : new Blob([payload], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", file, name);
  formData.append("pinataMetadata", JSON.stringify({ name }));

  const response = await fetch(PINATA_PIN_FILE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${runtimeEnv.PINATA_JWT}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed with status ${response.status}`);
  }

  const data = (await response.json()) as PinataUploadResponse;
  const cid = cidFromPinataResponse(data);
  if (!cid) {
    throw new Error("Pinata did not return a CID");
  }

  return cid;
}
