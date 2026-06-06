"use client";

import { AlertTriangle, Loader2, Unplug, Wallet } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import * as React from "react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { GENLAYER_CHAIN_ID } from "@/config/genlayer";
import { compactAddress } from "@/lib/utils";

function authErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const lowered = raw.toLowerCase();

  if (lowered.includes("user rejected") || lowered.includes("denied") || lowered.includes("disapproved")) {
    return "Signature rejected. Click again when you are ready to sign in.";
  }

  if (lowered.includes("provider") || lowered.includes("connector")) {
    return "Wallet provider is not ready. Reconnect your wallet and retry.";
  }

  return raw || "Wallet sign-in failed.";
}

export function WalletConnect({ className }: { className?: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const { address, chain, isConnected } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const [error, setError] = React.useState("");
  const [isSigning, setIsSigning] = React.useState(false);

  const connector = connectors[0];
  const signedWallet = session?.user?.walletAddress;
  const isBusy = isConnecting || isSwitching || isSigning || sessionStatus === "loading";

  async function signWallet(walletAddress: string) {
    setError("");
    setIsSigning(true);

    try {
      if (chain?.id !== GENLAYER_CHAIN_ID) {
        await switchChainAsync({ chainId: GENLAYER_CHAIN_ID });
      }

      const nonceResponse = await fetch("/api/auth/siwe-nonce", { cache: "no-store" });
      const { nonce } = (await nonceResponse.json()) as { nonce: string };
      const message = new SiweMessage({
        domain: window.location.host,
        address: walletAddress,
        statement: "Sign in to Disputr to manage on-chain arbitration cases and developer integrations.",
        uri: window.location.origin,
        version: "1",
        chainId: GENLAYER_CHAIN_ID,
        nonce,
        issuedAt: new Date().toISOString()
      });
      const signature = await signMessageAsync({ message: message.prepareMessage() });
      const result = await signIn("siwe", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
        callbackUrl: "/dashboard"
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        window.location.href = result.url ?? "/dashboard";
      }
    } catch (signError) {
      setError(authErrorMessage(signError));
    } finally {
      setIsSigning(false);
    }
  }

  async function handleConnect() {
    setError("");

    try {
      if (signedWallet) {
        await signOut({ redirect: false });
        disconnect();
        return;
      }

      if (isConnected && address) {
        await signWallet(address);
        return;
      }

      if (!connector) {
        setError("No browser wallet found.");
        return;
      }

      const result = await connectAsync({ connector });
      const connectedAddress = result.accounts[0];
      if (connectedAddress) {
        await signWallet(connectedAddress);
      }
    } catch (connectError) {
      setError(authErrorMessage(connectError));
    }
  }

  const label = signedWallet
    ? compactAddress(signedWallet)
    : isConnected && address
      ? "Sign Wallet"
      : connector
        ? "Connect Wallet"
        : "No Wallet";

  return (
    <div className={className}>
      <Button disabled={isBusy || (!connector && !signedWallet)} onClick={() => void handleConnect()} variant={signedWallet ? "outline" : "default"}>
        {isBusy ? <Loader2 className="size-5 animate-spin" /> : signedWallet ? <Unplug className="size-5" /> : <Wallet className="size-5" />}
        {label}
      </Button>
      {error ? (
        <p className="mt-2 flex max-w-sm items-start gap-2 text-xs font-semibold text-red-700">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
