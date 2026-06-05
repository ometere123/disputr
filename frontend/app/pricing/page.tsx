import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";

export default function PricingPage() {
  return (
    <AppShell active="Pricing">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          title="Pricing"
          description="Choose the arbitration and integration tier that fits your volume."
        />
        <div className="mt-8">
          <EmptyState
            title="Pricing is not configured"
            description="Pricing tiers will appear here after they are saved from real product configuration."
          />
        </div>
      </div>
    </AppShell>
  );
}
