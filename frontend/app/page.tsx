import { ArrowRight, Bell, BookOpen, CheckCircle2, FileUp, Gavel, Search, Settings, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WalletConnect } from "@/components/wallet-connect";

const workSteps = [
  {
    title: "Submit Evidence",
    body: "Parties upload signed scope, deliverables, communication screenshots, timestamps, and immutable evidence CIDs.",
    icon: FileUp
  },
  {
    title: "Intelligent Contract Analysis",
    body: "The GenLayer contract evaluates claimant and respondent bundles under validator consensus.",
    icon: Gavel
  },
  {
    title: "Appeal Window",
    body: "A stake-gated appeal flow lets parties challenge a verdict before finality.",
    icon: UsersRound
  },
  {
    title: "Final Resolution",
    body: "The binding structured verdict is committed on-chain and integrations receive signed webhooks.",
    icon: CheckCircle2
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border/70 bg-[#fffaf5]/90">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/disputr-logo.png" alt="Disputr" width={128} height={38} priority className="h-10 w-auto" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how">How it Works</a>
            <a href="#features">Features</a>
            <Link href="/pricing">Pricing</Link>
          </nav>
          <div className="ml-auto hidden items-center gap-5 text-primary md:flex">
            <Search className="size-5" />
            <Bell className="size-5" />
            <Settings className="size-5" />
          </div>
          <WalletConnect />
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#ead1c2] px-4 py-2 text-sm font-semibold text-primary">
            <Gavel className="size-4" />
            Powered by GenLayer Intelligent Contracts
          </div>
          <h1 className="mt-10 text-5xl font-extrabold leading-tight tracking-normal text-foreground md:text-7xl">
            Decentralized On-Chain <span className="text-primary">Arbitration Protocol</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            Resolve smart contract disputes with transparent evidence, structured reasoning, and on-chain finality.
            Disputr gives escrow products a neutral arbitration layer without hardcoding trust into a single operator.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/disputes/new">
                Start Arbitration <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/developers/api-docs">
                Read the Docs <BookOpen className="size-5" />
              </Link>
            </Button>
          </div>
        </div>

        <section id="how" className="mt-24">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-foreground">How Disputr Works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              A dispute lifecycle designed for evidence integrity, clear verdicts, and integration-ready automation.
            </p>
          </div>

          <div id="features" className="mt-10 grid gap-6 md:grid-cols-2">
            {workSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className={index === 3 ? "bg-primary text-primary-foreground" : ""}>
                  <div className="p-8">
                    <div className="inline-flex rounded-full bg-[#ead1c2] p-4 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-8 text-2xl font-extrabold">
                      {index + 1}. {step.title}
                    </h3>
                    <p className={index === 3 ? "mt-3 leading-7 text-[#f7e9df]" : "mt-3 leading-7 text-muted-foreground"}>
                      {step.body}
                    </p>
                    {index === 0 ? (
                      <div className="mt-8 rounded-xl border border-dashed border-border bg-[#ead9ca] p-10 text-center text-sm font-semibold uppercase text-muted-foreground">
                        Encrypted Dropzone
                      </div>
                    ) : null}
                    {index === 1 ? (
                      <div className="mt-16 rounded-xl bg-[#f5e5d8] p-5 text-sm text-muted-foreground">
                        <span className="mr-3 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">AI</span>
                        Analysis complete. Evidence bundle hashes are ready for on-chain evaluation.
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </section>

      <footer className="border-t border-border bg-[#fffaf5]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-12 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-lg font-bold text-foreground">
            Disputr <span className="size-2 rounded-full bg-[#c87338]" />
          </div>
          <p>2026 Disputr Arbitration Protocol. Built for GenLayer StudioNet.</p>
        </div>
      </footer>
    </main>
  );
}
