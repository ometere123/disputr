import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "muted" | "danger";

const variants: Record<BadgeVariant, string> = {
  default: "bg-[#ead1c2] text-primary",
  success: "bg-[#d7f0a2] text-[#176d44]",
  warning: "bg-[#f4dda1] text-[#8b5b10]",
  muted: "bg-muted text-muted-foreground",
  danger: "bg-[#f0c5bd] text-[#9b1c1c]"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", variants[variant], className)}
      {...props}
    />
  );
}
