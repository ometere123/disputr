import { Gavel, Plus, Trophy, WalletCards } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ContractStatus } from "@/components/contract-status";
import { DisputeTable } from "@/components/dispute-table";
import { MetricCard } from "@/components/metric-card";
import { MobileActionCards } from "@/components/mobile-action-card";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dashboardMetrics } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <AppShell active="Dashboard">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          eyebrow={<ContractStatus />}
          title="Dashboard"
          description="Overview of arbitration metrics and active cases."
          action={
            <Button asChild size="lg">
              <Link href="/disputes/new">
                <Plus className="size-5" />
                Open New Dispute
              </Link>
            </Button>
          }
        />
        <div className="mt-10 grid grid-cols-2 gap-4 md:hidden">
          <MobileMetric label="Staked" value="12,450" unit="GEN" icon={<WalletCards className="size-5" />} />
          <MobileMetric label="Active Cases" value="3" icon={<Gavel className="size-5" />} />
          <MobileMetric label="Rewards Earned" value="1.24" unit="GEN" icon={<Trophy className="size-5" />} wide />
        </div>
        <div className="mt-16 hidden gap-6 md:grid md:grid-cols-3">
          {dashboardMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} icon={metric.icon as "wallet" | "gavel" | "check"} />
          ))}
        </div>
        <section className="mt-20 hidden md:block">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-primary">Active Disputes</h2>
            <Link href="/disputes" className="font-semibold text-primary">
              View All
            </Link>
          </div>
          <DisputeTable />
        </section>
        <section className="mt-12 md:hidden">
          <MobileActionCards />
        </section>
      </div>
    </AppShell>
  );
}

function MobileMetric({
  label,
  value,
  unit,
  icon,
  wide = false
}: {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  wide?: boolean;
}) {
  return (
    <Card className={wide ? "col-span-2 p-5" : "p-5"}>
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="text-primary">{icon}</span>
        <span className="font-semibold">{label}</span>
      </div>
      <p className="mt-5 text-3xl font-extrabold text-primary">
        {value} {unit ? <span className="text-base font-medium text-muted-foreground">{unit}</span> : null}
      </p>
    </Card>
  );
}
