import {
  Bell,
  BookOpen,
  Gavel,
  Grid2X2,
  HelpCircle,
  History,
  Landmark,
  Search,
  Settings,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Grid2X2 },
  { label: "Active Disputes", href: "/disputes", icon: Gavel },
  { label: "Case History", href: "/disputes/90210/verdict", icon: History },
  { label: "Juror Pool", href: "/credentials", icon: UsersRound },
  { label: "Governance", href: "/developers", icon: Landmark }
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
        <div className="flex h-[82px] items-center gap-6 px-5 md:px-8">
          <Link href="/" className="mr-auto text-3xl font-extrabold tracking-normal text-primary md:w-64">
            Disputr
          </Link>
          <div className="hidden w-full max-w-md items-center gap-3 rounded-full border border-border bg-card px-4 py-3 text-muted-foreground md:flex">
            <Search className="size-5" />
            <span>{searchPlaceholder}</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button aria-label="Notifications" className="hidden rounded-full p-2 text-primary hover:bg-muted md:inline-flex">
              <Bell className="size-6" />
            </button>
            <Link aria-label="Settings" href="/settings" className="hidden rounded-full p-2 text-primary hover:bg-muted md:inline-flex">
              <Settings className="size-6" />
            </Link>
            <WalletConnect />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="fixed bottom-0 left-0 top-[82px] hidden w-80 flex-col border-r border-border/70 bg-[#fff6ee]/80 p-6 md:flex">
          <div>
            <h2 className="text-2xl font-bold text-primary">Protocol Menu</h2>
            <p className="mt-2 text-muted-foreground">Arbitration Interface</p>
          </div>
          <nav className="mt-12 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = item.label === active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-5 py-4 text-lg font-semibold text-muted-foreground transition-colors",
                    selected && "bg-[#ff9d5b] text-primary shadow-sm",
                    !selected && "hover:bg-muted"
                  )}
                >
                  <Icon className="size-6" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-border pt-6">
            <Link
              href="/pricing"
              className="mb-6 flex h-12 items-center justify-center rounded-full border border-primary bg-card text-base font-semibold text-primary"
            >
              Stake GEN
            </Link>
            <div className="flex items-center justify-around text-sm text-muted-foreground">
              <Link href="/developers/api-docs" className="flex flex-col items-center gap-2">
                <BookOpen className="size-5" />
                Docs
              </Link>
              <Link href="/settings" className="flex flex-col items-center gap-2">
                <HelpCircle className="size-5" />
                Support
              </Link>
            </div>
          </div>
        </aside>

        <main className="w-full pb-28 md:ml-80 md:pb-12">{children}</main>
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
              {item.label.replace("Active ", "")}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
