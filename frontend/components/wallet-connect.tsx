"use client";

import { Loader2, Unplug, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { GENLAYER_CHAIN_ID } from "@/config/genlayer";
import { compactAddress } from "@/lib/utils";

export function WalletConnect() {
  const { address, chain, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const injectedConnector = connectors[0];

  if (!isConnected || !address) {
    return (
      <Button disabled={!injectedConnector || isConnecting} onClick={() => injectedConnector && connect({ connector: injectedConnector })}>
        {isConnecting ? <Loader2 className="size-5 animate-spin" /> : <Wallet className="size-5" />}
        Connect Wallet
      </Button>
    );
  }

  if (chain?.id !== GENLAYER_CHAIN_ID) {
    return (
      <Button disabled={isSwitching} variant="secondary" onClick={() => switchChain({ chainId: GENLAYER_CHAIN_ID })}>
        {isSwitching ? <Loader2 className="size-5 animate-spin" /> : <Wallet className="size-5" />}
        Switch Network
      </Button>
    );
  }

  return (
    <Button onClick={() => disconnect()} variant="outline">
      <Unplug className="size-5" />
      {compactAddress(address)}
    </Button>
  );
}
