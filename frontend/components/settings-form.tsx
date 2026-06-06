"use client";

import { Bell, Loader2, Save, UserRound } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type ProfileResponse = {
  user: {
    name: string | null;
    email: string | null;
    notificationInApp: boolean;
    notificationEmail: boolean;
  };
  emailConfirmation?: {
    email: { ok: true } | { ok: false; reason: "not_configured" | "send_failed" } | false;
  };
};

export function SettingsForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notificationInApp, setNotificationInApp] = React.useState(true);
  const [notificationEmail, setNotificationEmail] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/me/profile", { cache: "no-store" });
        if (response.status === 401) {
          setError("Sign in to save account settings.");
          return;
        }

        if (!response.ok) {
          throw new Error("Profile load failed.");
        }

        const data = (await response.json()) as ProfileResponse;
        if (!cancelled) {
          setName(data.user.name ?? "");
          setEmail(data.user.email ?? "");
          setNotificationInApp(data.user.notificationInApp);
          setNotificationEmail(data.user.notificationEmail);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load profile settings.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setError("");
    setStatus("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          notificationInApp,
          notificationEmail
        })
      });

      if (response.status === 401) {
        setError("Sign in to save account settings.");
        return;
      }

      if (!response.ok) {
        throw new Error("Profile save failed.");
      }

      const data = (await response.json()) as ProfileResponse;
      const emailStatus = data.emailConfirmation?.email;
      if (emailStatus && typeof emailStatus === "object" && emailStatus.ok) {
        setStatus("Settings saved. Confirmation email sent.");
      } else if (notificationEmail && email && emailStatus && typeof emailStatus === "object" && emailStatus.reason === "not_configured") {
        setStatus("Settings saved. Add SMTP env values to send email notifications.");
      } else if (notificationEmail && email && emailStatus && typeof emailStatus === "object" && emailStatus.reason === "send_failed") {
        setStatus("Settings saved. Email provider rejected the confirmation send.");
      } else {
        setStatus("Settings saved.");
      }
    } catch {
      setError("Could not save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <UserRound className="size-6 text-primary" />
          <h2 className="text-2xl font-extrabold">Account</h2>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Input disabled={isLoading} placeholder="Display name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input
            disabled={isLoading}
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Bell className="size-6 text-primary" />
          <h2 className="text-2xl font-extrabold">Notifications</h2>
        </div>
        <p className="mt-4 text-muted-foreground">Receive updates for response windows, verdict delivery, and appeal status.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <Checkbox checked={notificationInApp} onCheckedChange={(checked) => setNotificationInApp(checked === true)} />
            <span className="font-semibold">In-app notifications</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <Checkbox checked={notificationEmail} onCheckedChange={(checked) => setNotificationEmail(checked === true)} />
            <span className="font-semibold">Email notifications</span>
          </label>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button disabled={isSaving || isLoading} onClick={() => void handleSave()} variant="outline">
            {isSaving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
            Save Preferences
          </Button>
          {status ? <span className="text-sm font-semibold text-[#176d44]">{status}</span> : null}
          {error ? <span className="text-sm font-semibold text-red-700">{error}</span> : null}
        </div>
      </Card>
    </div>
  );
}
