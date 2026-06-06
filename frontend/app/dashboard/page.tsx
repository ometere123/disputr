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
import { getUserDisputes, toDisputeTableRow } from "@/lib/server/dispute-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const disputes = await getUserDisputes({ limit: 6 });
  const tableRows = disputes.map(toDisputeTableRow);
  const openDisputes = disputes.filter((dispute) => dispute.status !== "resolved").length;
  const recentVerdicts = disputes.filter((dispute) => dispute.status === "resolved").length;
  const totalStake = disputes.reduce((sum, dispute) => sum + Number(dispute.stakeGen), 0);
  const dashboardMetrics = [
    {
      label: "Total Volume Arbitrated",
      value: totalStake.toLocaleString(),
      unit: "GEN",
      trend: disputes.length ? "From your indexed disputes" : "No database records yet",
      icon: "wallet" as const
    },
    {
      label: "Open Disputes",
      value: String(openDisputes),
      unit: "",
      trend: openDisputes ? "Requiring evidence or evaluation" : "No open disputes",
      icon: "gavel" as const
    },
    {
      label: "Recent Verdicts",
      value: String(recentVerdicts),
      unit: "",
      trend: recentVerdicts ? "Resolved disputes in your account" : "No verdicts delivered yet",
      icon: "check" as const
    }
  ];

  return (
    <AppShell active="Dashboard">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
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
        <div className="mt-8 grid grid-cols-2 gap-4 md:hidden">
          <MobileMetric label="Staked" value={totalStake.toLocaleString()} unit="GEN" icon={<WalletCards className="size-5" />} />
          <MobileMetric label="Active Cases" value={String(openDisputes)} icon={<Gavel className="size-5" />} />
          <MobileMetric label="Rewards Earned" value="0" unit="GEN" icon={<Trophy className="size-5" />} wide />
        </div>
        <div className="mt-10 hidden gap-5 md:grid md:grid-cols-3">
          {dashboardMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
        <section className="mt-12 hidden md:block">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-primary">Disputes</h2>
            <Link href="/disputes" className="font-semibold text-primary">
              View All
            </Link>
          </div>
          <DisputeTable disputes={tableRows} />
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
