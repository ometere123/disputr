import { ArrowRight, CheckCircle2, Code2, FileText, Gavel, ShieldCheck, Sparkles, Webhook } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tiers = [
  {
    name: "StudioNet Free",
    price: "$0",
    audience: "Wallet users and early testers",
    description: "Open and review StudioNet disputes while contract addresses, webhooks, and notification channels are tested.",
    icon: Gavel,
    href: "/disputes/new",
    action: "Open a dispute",
    features: ["5 StudioNet disputes per month", "Dashboard and verdict reads", "Evidence CID upload flow", "Credential viewer"],
    note: "Best for trying the full claimant/respondent flow."
  },
  {
    name: "Developer",
    price: "$29",
    audience: "Teams integrating the API",
    description: "Build with scoped API keys, signed webhooks, delivery logs, credential reads, and integration docs.",
    icon: Code2,
    href: "/developers",
    action: "Create API key",
    highlighted: true,
    features: ["100 disputes per month", "Scoped dk_ API keys", "Signed verdict.delivered webhooks", "Test webhook and copy curl tools"],
    note: "Use this for SaaS tools, escrow prototypes, and bounty platforms."
  },
  {
    name: "Protocol / Marketplace",
    price: "$199",
    audience: "Escrow and marketplace products",
    description: "Higher case volume, retry visibility, custom appeal windows, and operational support for production-like pilots.",
    icon: Webhook,
    href: "/docs#webhooks",
    action: "Plan integration",
    features: ["1,000 disputes per month", "Webhook retry monitoring", "Custom appeal windows", "Priority indexing checks"],
    note: "Built for platforms that need arbitration infrastructure."
  },
  {
    name: "Enterprise",
    price: "Custom",
    audience: "Large platforms and DAOs",
    description: "Custom arbitration flows, white-label case intake, audit exports, and dedicated launch support.",
    icon: ShieldCheck,
    href: "/docs#security",
    action: "Review controls",
    features: ["Custom volume", "White-label dispute flows", "Audit log exports", "Dedicated integration review"],
    note: "For teams with compliance, support, or high-volume requirements."
  }
];

const pricingAxes = [
  {
    title: "Case volume",
    body: "Disputr pricing scales with the number of arbitration cases a wallet or platform sends through the protocol."
  },
  {
    title: "Integration depth",
    body: "B2B plans include API keys, webhook delivery, credential reads, logs, and support for marketplace workflows."
  },
  {
    title: "Mainnet settlement",
    body: "Real arbitration fee routing, billing enforcement, and production settlement should only activate when mainnet is ready."
  }
];

export default function PricingPage() {
  return (
    <AppShell active="Pricing">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          eyebrow={<Badge variant="success">StudioNet beta pricing</Badge>}
          title="Pricing"
          description="Disputr prices around case volume and integration depth, because the product serves both wallet users and platforms."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pricingAxes.map((axis) => (
            <Card key={axis.title} className="p-5">
              <Sparkles className="size-5 text-primary" />
              <h2 className="mt-4 text-lg font-extrabold">{axis.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{axis.body}</p>
            </Card>
          ))}
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card key={tier.name} className={tier.highlighted ? "border-primary p-6 shadow-button" : "p-6"}>
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-lg bg-[#fff1eb] p-3 text-primary">
                    <Icon className="size-6" />
                  </div>
                  {tier.highlighted ? <Badge>Best for builders</Badge> : null}
                </div>
                <h2 className="mt-6 text-2xl font-extrabold text-primary">{tier.name}</h2>
                <p className="mt-2 min-h-10 text-sm font-semibold text-muted-foreground">{tier.audience}</p>
                <p className="mt-5 text-5xl font-extrabold text-foreground">{tier.price}</p>
                <p className="mt-4 min-h-24 text-sm leading-6 text-muted-foreground">{tier.description}</p>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#176d44]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 rounded-xl bg-[#fff4eb] p-4 text-sm leading-6 text-muted-foreground">{tier.note}</p>
                <Button asChild className="mt-6 w-full" variant={tier.highlighted ? "default" : "outline"}>
                  <Link href={tier.href}>
                    {tier.action} <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </Card>
            );
          })}
        </section>

        <section className="mt-10 rounded-[18px] border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <FileText className="size-6 text-primary" />
                <h2 className="text-2xl font-extrabold text-primary">What is active now?</h2>
              </div>
              <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
                The StudioNet app is ready for wallet onboarding, dispute creation, API-key generation, signed webhook
                tests, notification tests, docs, and delivery logs. Checkout and enforceable payment collection are the
                only pricing pieces held for mainnet because they should be tied to production settlement and final
                arbitration economics.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/docs#api-reference">
                API reference <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
