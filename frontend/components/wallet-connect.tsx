"use client";

import { AlertTriangle, Loader2, Unplug, Wallet, X } from "lucide-react";
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
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
        setIsModalOpen(false);
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

  async function handlePrimaryClick() {
    if (signedWallet) {
      await signOut({ redirect: false });
      disconnect();
      return;
    }

    setError("");
    setIsModalOpen(true);
  }

  return (
    <div className={className}>
      <Button disabled={isBusy || (!connector && !signedWallet)} onClick={() => void handlePrimaryClick()} variant={signedWallet ? "outline" : "default"}>
        {isBusy ? <Loader2 className="size-5 animate-spin" /> : signedWallet ? <Unplug className="size-5" /> : <Wallet className="size-5" />}
        {label}
      </Button>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1b120d]/45 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ead1c2] text-primary">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-muted-foreground">Disputr</p>
                  <h2 className="text-2xl font-extrabold text-primary">Connect a wallet</h2>
                </div>
              </div>
              <button
                aria-label="Close wallet modal"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-5 leading-7 text-muted-foreground">
              Connect the wallet you want tied to your Disputr cases. We will prompt you to switch to GenLayer StudioNet
              and sign a no-cost message.
            </p>

            <div className="mt-6 space-y-3">
              <Button className="w-full" disabled={isBusy || !connector} onClick={() => void handleConnect()} size="lg">
                {isBusy ? <Loader2 className="size-5 animate-spin" /> : <Wallet className="size-5" />}
                {isConnected && address ? `Sign as ${compactAddress(address)}` : "Browser wallet"}
              </Button>
              {isConnected && address ? (
                <Button className="w-full" onClick={() => disconnect()} variant="ghost">
                  Disconnect or switch wallet
                </Button>
              ) : null}
            </div>

            {error ? (
              <p className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            ) : null}

            <p className="mt-5 text-center text-xs text-muted-foreground">
              By continuing you agree to use Disputr with the connected wallet as your account identity.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
