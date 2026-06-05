"use client";

import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";
import { GENLAYER_CHAIN_ID, GENLAYER_RPC_URL } from "@/config/genlayer";

export const genLayerStudioNet = defineChain({
  id: GENLAYER_CHAIN_ID,
  name: "GenLayer StudioNet",
  nativeCurrency: {
    decimals: 18,
    name: "GEN",
    symbol: "GEN"
  },
  rpcUrls: {
    default: {
      http: [GENLAYER_RPC_URL]
    }
  },
  blockExplorers: {
    default: {
      name: "GenLayer Studio",
      url: "https://studio.genlayer.com"
    }
  }
});

export const wagmiConfig = createConfig({
  chains: [genLayerStudioNet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [genLayerStudioNet.id]: http(GENLAYER_RPC_URL)
  },
  ssr: true
});
