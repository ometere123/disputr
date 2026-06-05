import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { RespondEvidenceForm } from "@/components/respond-evidence-form";

export default async function RespondPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell active="Disputes">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          title="Submit Counter-Evidence"
          description={`Respond to case ${id} with immutable evidence references, scope objections, and delivery context.`}
        />
        <RespondEvidenceForm disputeId={id} />
      </div>
    </AppShell>
  );
}
