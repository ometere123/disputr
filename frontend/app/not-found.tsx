import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md rounded-[18px] border border-border bg-card p-8 text-center shadow-soft">
        <h1 className="text-5xl font-extrabold text-primary">404</h1>
        <p className="mt-4 text-muted-foreground">This arbitration view does not exist.</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
