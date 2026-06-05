import { AppShell } from "@/components/app-shell";
import { DisputeForm } from "@/components/dispute-form";
import { PageHeading } from "@/components/page-heading";

export default function NewDisputePage() {
  return (
    <AppShell active="Disputes" searchPlaceholder="Search...">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          title="Open a Dispute"
          description="Initiate formal arbitration by providing contract details, involved parties, and supporting evidence."
        />
        <div className="mt-8">
          <DisputeForm />
        </div>
      </div>
    </AppShell>
  );
}
