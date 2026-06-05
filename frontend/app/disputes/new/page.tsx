import { AppShell } from "@/components/app-shell";
import { DisputeForm } from "@/components/dispute-form";
import { PageHeading } from "@/components/page-heading";

export default function NewDisputePage() {
  return (
    <AppShell active="Active Disputes" searchPlaceholder="Search...">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          title="Open a Dispute"
          description="Initiate formal arbitration by providing contract details, involved parties, and supporting evidence."
        />
        <div className="mt-20">
          <DisputeForm />
        </div>
      </div>
    </AppShell>
  );
}
