import { ArrowRight, Bell, BookOpen, Code2, FilePlus2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tracks = [
  {
    title: "For users",
    description: "Open a dispute, attach evidence CIDs, and follow the case through response, verdict, appeal, and credential.",
    actions: [
      { label: "Open first dispute", href: "/disputes/new", icon: FilePlus2 },
      { label: "Read dispute flow", href: "/docs#open-dispute", icon: BookOpen }
    ]
  },
  {
    title: "For platforms",
    description: "Create a scoped API key, register a signed webhook, and test your verdict delivery endpoint before going live.",
    actions: [
      { label: "Create API key", href: "/developers", icon: Code2 },
      { label: "Verify webhooks", href: "/docs#webhooks", icon: Bell }
    ]
  }
];

export function OnboardingPanel() {
  return (
    <section className="mt-8 rounded-[18px] border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#d7f0a2] px-3 py-1 text-sm font-bold text-[#176d44]">
            <ShieldCheck className="size-4" />
            Ready to configure
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-primary">Start with the path that matches you.</h2>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Disputr is both a user arbitration console and a B2B integration layer. These are the two fastest paths to a
            real StudioNet test.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/docs">
            Open handbook <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {tracks.map((track) => (
          <div key={track.title} className="rounded-xl border border-border bg-[#fffaf5] p-5">
            <h3 className="text-xl font-extrabold">{track.title}</h3>
            <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">{track.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {track.actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button key={action.href} asChild size="sm" variant="outline">
                    <Link href={action.href}>
                      <Icon className="size-4" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
