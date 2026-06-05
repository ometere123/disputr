import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DeveloperSettings } from "@/components/developer-settings";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";

export default function DevelopersPage() {
  return (
    <AppShell active="Governance" searchPlaceholder="Search...">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading
          title="Developer Settings"
          description="Manage your API keys, webhook endpoints, and integration preferences."
          action={
            <Button size="lg">
              <Plus className="size-5" />
              Generate New Key
            </Button>
          }
        />
        <div className="mt-12">
          <DeveloperSettings />
        </div>
      </div>
    </AppShell>
  );
}
