"use client";

import { Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import * as React from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInOptions() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [isEmailBusy, setIsEmailBusy] = React.useState(false);

  async function handleGoogle() {
    setError("");
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  async function handleEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!email.trim()) {
      setError("Enter an email address first.");
      return;
    }

    setIsEmailBusy(true);
    try {
      const result = await signIn("nodemailer", {
        email: email.trim(),
        redirect: false,
        callbackUrl: "/dashboard"
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setStatus("Magic link sent. Check your inbox.");
    } catch {
      setError("Email sign-in is not configured yet.");
    } finally {
      setIsEmailBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <WalletConnect className="[&>button]:w-full" />
      <Button className="w-full" onClick={() => void handleGoogle()} variant="outline">
        <Mail className="size-5" />
        Continue with Google
      </Button>
      <form className="space-y-3" onSubmit={(event) => void handleEmail(event)}>
        <Input
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button className="w-full" disabled={isEmailBusy} type="submit" variant="secondary">
          Send Magic Link
        </Button>
      </form>
      {status ? <p className="text-sm font-semibold text-[#176d44]">{status}</p> : null}
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
