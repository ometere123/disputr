import { UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function RespondPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell active="Active Disputes">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          title="Submit Counter-Evidence"
          description={`Respond to case ${id} with immutable evidence references, scope objections, and delivery context.`}
        />
        <Card className="mt-12 p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <label>
              <span className="font-semibold text-muted-foreground">Respondent Evidence CID *</span>
              <Input className="mt-3" placeholder="bafy..." />
            </label>
            <label>
              <span className="font-semibold text-muted-foreground">Communication Bundle CID</span>
              <Input className="mt-3" placeholder="bafy..." />
            </label>
          </div>
          <div className="mt-8 rounded-xl border border-dashed border-border bg-[#ead9ca] p-12 text-center">
            <UploadCloud className="mx-auto size-10 text-primary" />
            <p className="mt-4 font-semibold text-muted-foreground">Upload screenshots, delivery notes, and counter-scope evidence</p>
          </div>
          <Textarea className="mt-8" placeholder="Explain the counter-evidence and any missing context..." />
          <div className="mt-8 flex justify-end">
            <Button>Submit Response</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
