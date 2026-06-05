import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pricingTiers } from "@/lib/demo-data";

export default function PricingPage() {
  return (
    <AppShell active="Governance">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          title="Pricing"
          description="Choose the arbitration and integration tier that fits your volume."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className="flex min-h-[32rem] flex-col p-7">
              <h2 className="text-3xl font-extrabold text-primary">{tier.name}</h2>
              <p className="mt-5 text-4xl font-extrabold">{tier.price}</p>
              <p className="mt-3 min-h-12 text-muted-foreground">{tier.target}</p>
              <div className="mt-8 space-y-4">
                {tier.includes.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#176d44]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-auto w-full" variant={tier.name === "Builder" ? "default" : "outline"}>
                Select {tier.name}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
