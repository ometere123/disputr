import { env, type RuntimeEnv } from "../env.js";

export function getGenLayerConfig(runtimeEnv: RuntimeEnv = env) {
  return {
    chainId: runtimeEnv.NEXT_PUBLIC_GENLAYER_CHAIN_ID,
    rpcUrl: runtimeEnv.NEXT_PUBLIC_GENLAYER_RPC_URL,
    contracts: {
      disputr: runtimeEnv.NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS ?? "",
      credentialNft: runtimeEnv.NEXT_PUBLIC_DISPUTR_NFT_CONTRACT_ADDRESS ?? "",
      appealOracle: runtimeEnv.NEXT_PUBLIC_APPEAL_ORACLE_CONTRACT_ADDRESS ?? ""
    }
  };
}

export function isDisputrContractConfigured(runtimeEnv: RuntimeEnv = env) {
  return Boolean(getGenLayerConfig(runtimeEnv).contracts.disputr);
}
