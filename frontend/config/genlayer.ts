export const GENLAYER_CHAIN_ID = Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID ?? 61999);
export const GENLAYER_RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "https://studio.genlayer.com/api";

export const contractAddresses = {
  disputr: process.env.NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS ?? "",
  credentialNft: process.env.NEXT_PUBLIC_DISPUTR_NFT_CONTRACT_ADDRESS ?? "",
  appealOracle: process.env.NEXT_PUBLIC_APPEAL_ORACLE_CONTRACT_ADDRESS ?? ""
};

export function isContractConfigured(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export const contractStatus = {
  disputr: isContractConfigured(contractAddresses.disputr),
  credentialNft: isContractConfigured(contractAddresses.credentialNft),
  appealOracle: isContractConfigured(contractAddresses.appealOracle)
};
