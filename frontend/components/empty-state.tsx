import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-card p-8 text-center">
      <div className="rounded-full bg-muted p-4 text-primary">
        <Inbox className="size-8" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-primary">{title}</h2>
      <p className="mt-3 max-w-md text-muted-foreground">{description}</p>
      {action ? (
        <Button asChild className="mt-6">
          <a href={action.href}>{action.label}</a>
        </Button>
      ) : null}
    </div>
  );
}
