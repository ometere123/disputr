import { Shield } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ContractStatus } from "@/components/contract-status";
import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <AppShell active="Settings">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <PageHeading title="Settings" description="Manage account preferences, notifications, and protocol configuration." />
        <div className="mt-8 space-y-5">
          <SettingsForm />
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Shield className="size-6 text-primary" />
              <h2 className="text-2xl font-extrabold">Contract Configuration</h2>
            </div>
            <div className="mt-5">
              <ContractStatus />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
