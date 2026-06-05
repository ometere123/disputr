import { CheckCheck, Gavel, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/card";

const iconMap = {
  wallet: WalletCards,
  gavel: Gavel,
  check: CheckCheck
};

export function MetricCard({
  label,
  value,
  unit,
  trend,
  icon
}: {
  label: string;
  value: string;
  unit?: string;
  trend: string;
  icon: keyof typeof iconMap;
}) {
  const Icon = iconMap[icon];

  return (
    <Card className="min-h-36 p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-[12rem] text-sm font-semibold uppercase tracking-normal text-muted-foreground">{label}</p>
        <div className="rounded-lg bg-[#ead2c2] p-2.5 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-6 flex items-end gap-2">
        <span className="text-4xl font-extrabold text-primary">{value}</span>
        {unit ? <span className="pb-1.5 text-base font-semibold text-muted-foreground">{unit}</span> : null}
      </div>
      <p className="mt-3 text-sm font-semibold text-muted-foreground">{trend}</p>
    </Card>
  );
}
