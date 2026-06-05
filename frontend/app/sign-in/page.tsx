import { Mail, WalletCards } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WalletConnect } from "@/components/wallet-connect";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md p-8">
        <Link href="/" className="text-3xl font-extrabold text-primary">
          Disputr
        </Link>
        <h1 className="mt-10 text-4xl font-extrabold tracking-normal">Sign in</h1>
        <p className="mt-3 text-muted-foreground">Use a wallet for on-chain disputes, or continue with email or Google.</p>
        <div className="mt-8 space-y-4">
          <WalletConnect />
          <Button className="w-full" variant="outline">
            <Mail className="size-5" />
            Continue with Google
          </Button>
          <div className="space-y-3">
            <Input type="email" placeholder="name@company.com" />
            <Button className="w-full" variant="secondary">
              <WalletCards className="size-5" />
              Send Magic Link
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
