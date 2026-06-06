import { existsSync, readFileSync } from "node:fs";

function loadDotenv(path: string) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))
        ? rawValue.slice(1, -1)
        : rawValue;

    process.env[key] ??= value;
  }
}

loadDotenv(".env");

const required = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_GENLAYER_CHAIN_ID",
  "NEXT_PUBLIC_GENLAYER_RPC_URL",
  "DATABASE_URL",
  "PINATA_JWT",
  "PINATA_GATEWAY",
  "AUTH_SECRET",
  "NEXTAUTH_URL"
];

const optionalContractAddresses = [
  "NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS",
  "NEXT_PUBLIC_DISPUTR_NFT_CONTRACT_ADDRESS",
  "NEXT_PUBLIC_APPEAL_ORACLE_CONTRACT_ADDRESS"
];

const missing = required.filter((key) => !process.env[key]);
const unsetContracts = optionalContractAddresses.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required env values: ${missing.join(", ")}`);
  process.exitCode = 1;
}

if (unsetContracts.length > 0) {
  console.warn(`Contract env values not configured yet: ${unsetContracts.join(", ")}`);
}

if (process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID && process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID !== "61999") {
  console.warn("NEXT_PUBLIC_GENLAYER_CHAIN_ID should be 61999 for GenLayer StudioNet.");
}

if ((process.env.EMAIL_SERVER && !process.env.EMAIL_FROM) || (!process.env.EMAIL_SERVER && process.env.EMAIL_FROM)) {
  console.warn("Email notifications need both EMAIL_SERVER and EMAIL_FROM. Use EMAIL_FROM like \"Disputr <no-reply@yourdomain.com>\".");
}

if (!process.exitCode) {
  console.log("Environment check complete. DATABASE_URL should point to Supabase Postgres or a Cloudflare Hyperdrive-backed Supabase connection.");
}
