"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md rounded-[18px] border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f0c5bd] text-primary">
          <AlertTriangle className="size-7" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-primary">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">The current view failed to load. Retry after checking your connection.</p>
        <Button className="mt-6" onClick={reset}>
          Retry
        </Button>
      </div>
    </main>
  );
}
