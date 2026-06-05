import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { RespondEvidenceForm } from "@/components/respond-evidence-form";

export default async function RespondPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell active="Active Disputes">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          title="Submit Counter-Evidence"
          description={`Respond to case ${id} with immutable evidence references, scope objections, and delivery context.`}
        />
        <RespondEvidenceForm disputeId={id} />
      </div>
    </AppShell>
  );
}
