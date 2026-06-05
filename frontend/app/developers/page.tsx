import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DeveloperSettings } from "@/components/developer-settings";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";

export default function DevelopersPage() {
  return (
    <AppShell active="Developers" searchPlaceholder="Search...">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading
          title="Developers"
          description="Manage your API keys, webhook endpoints, and integration preferences."
          action={
            <Button size="lg" disabled>
              <Plus className="size-5" />
              Create API Key
            </Button>
          }
        />
        <div className="mt-8">
          <DeveloperSettings />
        </div>
      </div>
    </AppShell>
  );
}
