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
    <Card className="min-h-44 p-7">
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-[13rem] text-base font-semibold uppercase tracking-normal text-muted-foreground">{label}</p>
        <div className="rounded-xl bg-[#ead2c2] p-3 text-primary">
          <Icon className="size-6" />
        </div>
      </div>
      <div className="mt-10 flex items-end gap-3">
        <span className="text-5xl font-extrabold text-primary">{value}</span>
        {unit ? <span className="pb-2 text-xl font-semibold text-muted-foreground">{unit}</span> : null}
      </div>
      <p className="mt-4 text-sm font-semibold text-[#176d44]">{trend}</p>
    </Card>
  );
}
