"use client";

import { ArrowRight, CheckCircle2, FileText, Gavel, ShieldCheck, Wallet, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";

const tutorialSteps = [
  {
    icon: Wallet,
    title: "Connect once",
    body: "Your wallet becomes the account identity for cases, credentials, API keys, and notifications."
  },
  {
    icon: FileText,
    title: "Write evidence",
    body: "You can write plain text. Disputr packages it into an evidence bundle and uploads it to IPFS for a CID."
  },
  {
    icon: Gavel,
    title: "Submit the CID",
    body: "The GenLayer contract receives parties, stake, deadlines, and CIDs. Raw evidence stays off-chain."
  },
  {
    icon: ShieldCheck,
    title: "Track the outcome",
    body: "Verdicts, appeal windows, credentials, notifications, and webhooks are tracked from the dashboard."
  }
];

export function FirstRunTutorial() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const shouldShow = window.localStorage.getItem("disputr_show_welcome") === "1";
    const seen = window.localStorage.getItem("disputr_tutorial_seen") === "1";

    if (shouldShow && !seen) {
      setIsOpen(true);
    }
  }, []);

  function close() {
    window.localStorage.setItem("disputr_tutorial_seen", "1");
    window.localStorage.removeItem("disputr_show_welcome");
    setIsOpen(false);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#1b120d]/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#d7f0a2] px-3 py-1 text-sm font-bold text-[#176d44]">
              <CheckCircle2 className="size-4" />
              Wallet connected
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-primary">Here is how Disputr works.</h2>
            <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
              You do not need to understand CIDs before filing a case. The app helps create them, and the contract uses
              those CIDs exactly as deployed.
            </p>
          </div>
          <button
            aria-label="Close tutorial"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary"
            onClick={close}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {tutorialSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-xl border border-border bg-[#fffaf5] p-4">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-3 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild onClick={close}>
            <Link href="/disputes/new">
              Open a dispute <ArrowRight className="size-4" />
            </Link>
          </Button>
          <div className="flex gap-3">
            <Button asChild variant="outline" onClick={close}>
              <Link href="/docs#evidence-cids">Learn CIDs</Link>
            </Button>
            <Button onClick={close} variant="ghost">
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
