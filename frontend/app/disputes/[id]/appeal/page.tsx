import { AppShell } from "@/components/app-shell";
import { AppealForm } from "@/components/appeal-form";
import { ContractStatus } from "@/components/contract-status";
import { PageHeading } from "@/components/page-heading";

export default async function AppealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell active="Disputes">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          eyebrow={<ContractStatus />}
          title="File an Appeal"
          description={`Submit stake-backed appeal evidence for case ${id} before the appeal window closes.`}
        />
        <AppealForm disputeId={id} />
      </div>
    </AppShell>
  );
}
