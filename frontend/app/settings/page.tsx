import { Bell, Shield, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ContractStatus } from "@/components/contract-status";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <AppShell active="Dashboard">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-12 md:py-14">
        <PageHeading title="Settings" description="Manage account preferences, notifications, and protocol configuration." />
        <div className="mt-12 space-y-6">
          <Card className="p-8">
            <div className="flex items-center gap-4">
              <UserRound className="size-7 text-primary" />
              <h2 className="text-2xl font-extrabold">Account</h2>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Input placeholder="Display name" />
              <Input placeholder="Email address" />
            </div>
          </Card>
          <Card className="p-8">
            <div className="flex items-center gap-4">
              <Shield className="size-7 text-primary" />
              <h2 className="text-2xl font-extrabold">Contract Configuration</h2>
            </div>
            <div className="mt-5">
              <ContractStatus />
            </div>
          </Card>
          <Card className="p-8">
            <div className="flex items-center gap-4">
              <Bell className="size-7 text-primary" />
              <h2 className="text-2xl font-extrabold">Notifications</h2>
            </div>
            <p className="mt-4 text-muted-foreground">Receive updates for response windows, verdict delivery, and appeal status.</p>
            <Button className="mt-6" variant="outline">
              Save Preferences
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
