import {
  BadgeCheck,
  BookOpen,
  Code2,
  Gavel,
  Grid2X2,
  HelpCircle,
  Search,
  Settings
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { NotificationBell } from "@/components/notification-bell";
import { WalletConnect } from "@/components/wallet-connect";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Grid2X2 },
  { label: "Disputes", href: "/disputes", icon: Gavel },
  { label: "Credentials", href: "/credentials", icon: BadgeCheck },
  { label: "Developers", href: "/developers", icon: Code2 },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function AppShell({
  active,
  children,
  searchPlaceholder = "Search disputes..."
}: {
  active: string;
  children: ReactNode;
  searchPlaceholder?: string;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-[#fffaf5]/90 backdrop-blur">
        <div className="flex h-16 items-center gap-5 px-4 md:px-7">
          <Link href="/" className="mr-auto flex items-center md:w-56">
            <Image src="/disputr-logo.png" alt="Disputr" width={128} height={48} priority className="h-8 w-auto" />
          </Link>
          <div className="hidden h-11 w-full max-w-md items-center gap-3 rounded-full border border-border bg-card px-4 text-sm text-muted-foreground md:flex">
            <Search className="size-5" />
            <span>{searchPlaceholder}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <Link aria-label="Settings" href="/settings" className="hidden rounded-full p-2 text-primary hover:bg-muted md:inline-flex">
              <Settings className="size-5" />
            </Link>
            <WalletConnect />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="fixed bottom-0 left-0 top-16 hidden w-72 flex-col border-r border-border/70 bg-[#fff6ee]/80 p-5 md:flex">
          <div>
            <h2 className="text-xl font-bold text-primary">Disputr Console</h2>
            <p className="mt-1 text-sm text-muted-foreground">On-chain arbitration</p>
          </div>
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = item.label === active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-semibold text-muted-foreground transition-colors",
                    selected && "bg-[#ff9d5b] text-primary shadow-sm",
                    !selected && "hover:bg-muted"
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-border pt-5">
            <Link
              href="/pricing"
              className={cn(
                "mb-5 flex h-11 items-center justify-center rounded-full border border-primary text-sm font-semibold text-primary",
                active === "Pricing" ? "bg-[#ff9d5b]" : "bg-card"
              )}
            >
              Pricing
            </Link>
            <div className="flex items-center justify-around text-sm text-muted-foreground">
              <Link href="/docs" className="flex flex-col items-center gap-2">
                <BookOpen className="size-5" />
                Docs
              </Link>
              <Link href="/settings" className="flex flex-col items-center gap-2">
                <HelpCircle className="size-5" />
                Settings
              </Link>
            </div>
          </div>
        </aside>

        <main className="w-full pb-28 md:ml-72 md:pb-10">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 rounded-t-2xl border border-border bg-[#fffaf5] px-5 py-3 shadow-soft md:hidden">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const selected = item.label === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-full px-2 py-2 text-xs text-muted-foreground",
                selected && "bg-[#ecd2c1] text-primary"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
