"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DocsHeaderActions() {
  const { data: session, status } = useSession();
  const isSignedIn = Boolean(session?.user);

  if (isSignedIn || status === "loading") {
    return (
      <Button asChild>
        <Link href="/dashboard">Open console</Link>
      </Button>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" className="hidden md:inline-flex">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/dashboard">Launch app</Link>
      </Button>
    </>
  );
}
