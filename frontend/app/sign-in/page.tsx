import Link from "next/link";
import { SignInOptions } from "@/components/sign-in-options";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md p-8">
        <Link href="/" className="text-3xl font-extrabold text-primary">
          Disputr
        </Link>
        <h1 className="mt-10 text-4xl font-extrabold tracking-normal">Sign in</h1>
        <p className="mt-3 text-muted-foreground">Use a wallet for on-chain disputes, or continue with email or Google.</p>
        <div className="mt-8">
          <SignInOptions />
        </div>
      </Card>
    </main>
  );
}
