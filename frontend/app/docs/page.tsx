import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  ExternalLink,
  Gavel,
  KeyRound,
  ShieldCheck,
  Webhook
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DISPUTR_API_URL } from "@/config/app";

const navGroups = [
  {
    title: "Getting Started",
    links: [
      { label: "Introduction", href: "#introduction" },
      { label: "Two-sided product", href: "#audiences" },
      { label: "Pricing model", href: "#pricing-model" },
      { label: "Evidence CIDs", href: "#evidence-cids" },
      { label: "Contract config", href: "#contracts" }
    ]
  },
  {
    title: "Developers",
    links: [
      { label: "API keys", href: "#api-keys" },
      { label: "Open dispute", href: "#open-dispute" },
      { label: "Webhooks", href: "#webhooks" },
      { label: "Receiver example", href: "#webhook-receiver" },
      { label: "Endpoints", href: "#api-reference" }
    ]
  },
  {
    title: "Operations",
    links: [
      { label: "Deployments", href: "#deployments" },
      { label: "Error model", href: "#error-model" },
      { label: "Security", href: "#security" }
    ]
  }
];

const endpoints = [
  ["POST", "/v1/dispute", "write:disputes", "Create a database-backed dispute record and polling job."],
  ["GET", "/v1/dispute/:id", "read:verdicts", "Read dispute state plus verdict if it has been delivered."],
  ["GET", "/v1/verdict/:id", "read:verdicts", "Fetch structured verdict reasoning, confidence, and evidence weights."],
  ["POST", "/v1/appeal", "write:disputes", "Submit appeal evidence and GEN stake metadata."],
  ["GET", "/v1/credentials/:address", "read:credentials", "List soulbound arbitration credentials for a wallet."],
  ["POST", "/v1/webhooks", "write:webhooks", "Register an HTTPS endpoint for verdict.delivered."]
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-[#fffaf5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/disputr-logo.png" alt="Disputr" width={126} height={38} className="h-9 w-auto" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
            <Link href="/#how">How it works</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/developers">Developers</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Launch app</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[220px_1fr_220px]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-8">
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{group.title}</p>
                <ul className="mt-3 space-y-2 text-sm font-medium text-muted-foreground">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 space-y-14">
          <section id="introduction" className="scroll-mt-24">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ead1c2] px-4 py-2 text-sm font-bold text-primary">
              <Gavel className="size-4" />
              GenLayer StudioNet arbitration
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-normal text-foreground md:text-6xl">
              Disputr docs for users, marketplaces, and escrow teams.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              Disputr stores raw evidence off-chain, commits evidence CIDs and structured verdicts on-chain, and exposes a
              B2B API for products that need neutral arbitration.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Evidence first", "Claimant and respondent bundles are referenced by immutable CIDs."],
                ["Verdict ready", "GenLayer Intelligent Contracts produce confidence, reasoning, and weights."],
                ["Integration native", "API keys, webhooks, and credentials are part of the same product surface."]
              ].map(([title, body]) => (
                <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <CheckCircle2 className="size-5 text-[#176d44]" />
                  <h2 className="mt-4 text-lg font-extrabold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="audiences" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Two-sided product</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <BookOpen className="size-6 text-primary" />
                <h3 className="mt-4 text-2xl font-extrabold">Users</h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  Wallet users open disputes, upload evidence, respond to cases, view verdicts, file appeals, and receive
                  soulbound credential records.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <Code2 className="size-6 text-primary" />
                <h3 className="mt-4 text-2xl font-extrabold">B2B integrators</h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  Marketplaces and escrow protocols use scoped `dk_` keys, REST endpoints, signed webhooks, and credential
                  reads without handling private evidence on-chain.
                </p>
              </div>
            </div>
          </section>

          <section id="pricing-model" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Pricing model</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Disputr pricing is based on case volume and integration depth. StudioNet uses beta pricing without checkout;
              production billing and fee settlement should only activate when mainnet economics are final.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Info title="Users" body="Free StudioNet access for wallet onboarding, evidence upload, verdict reads, and credentials." />
              <Info title="Developers" body="API keys, signed webhooks, delivery logs, and credential reads for integration teams." />
              <Info title="Protocols" body="Higher volume, retry monitoring, custom appeal windows, and audit exports for platforms." />
            </div>
          </section>

          <section id="evidence-cids" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Evidence CIDs</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Users do not need to manually create CIDs. In the dispute, response, and appeal forms, they can write plain
              text evidence. Disputr packages that text into a structured JSON bundle, uploads it to IPFS through Pinata,
              and fills the generated CID into the contract field.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Info title="Plain text first" body="Write scope, evidence, deliverables, timeline, communications, and requested outcome." />
              <Info title="CID generated" body="The app uploads the bundle off-chain and returns the immutable CID used by GenLayer." />
              <Info title="Advanced mode" body="Technical users and B2B teams can paste an existing CID or submit one through the API." />
            </div>
            <CodeBlock
              filename="evidence-bundle.json"
              code={`{
  "schema": "disputr.evidence.bundle.v1",
  "side": "claimant",
  "scope": "Milestone agreement and delivery terms...",
  "claimantEvidence": "Work was completed and accepted...",
  "deliverables": ["Repository", "API endpoint", "handoff notes"],
  "timestamps": ["2026-06-06 submitted final build"],
  "communications": "Relevant chat/email context",
  "requestedOutcome": "Release escrow to claimant"
}`}
            />
          </section>

          <section id="contracts" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Contract config</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Contracts are deployed manually by the project owner. The UI and backend read addresses from env variables and
              show configured or not configured states without hardcoding fake addresses.
            </p>
            <CodeBlock
              filename=".env"
              code={`NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DISPUTR_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_APPEAL_ORACLE_CONTRACT_ADDRESS=0x...`}
            />
          </section>

          <section id="api-keys" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">API keys</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Create keys in the Developers page. Plaintext is shown once, stored as SHA-256 at rest, and must be sent as a
              bearer token. Keys use the `dk_` prefix.
            </p>
            <CodeBlock
              filename="request"
              code={`curl ${DISPUTR_API_URL}/v1/dispute \\
  -H "Authorization: Bearer dk_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{ "escrow_address": "0x...", "claimant": "0x...", "respondent": "0x...", "evidence_bundle_hash": "bafy..." }'`}
            />
          </section>

          <section id="open-dispute" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Open dispute payload</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Evidence is uploaded to IPFS first. Only the CID and metadata needed for arbitration are recorded by the API
              and contract calls.
            </p>
            <CodeBlock
              filename="payload.json"
              code={`{
  "escrow_address": "0x1111111111111111111111111111111111111111",
  "claimant": "0x2222222222222222222222222222222222222222",
  "respondent": "0x3333333333333333333333333333333333333333",
  "evidence_bundle_hash": "bafybeigdyrzt...",
  "scope_doc_hash": "bafybeif7...",
  "stake_gen": "0"
}`}
            />
          </section>

          <section id="webhooks" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Webhooks</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Disputr delivers `verdict.delivered` to registered HTTPS endpoints. Each delivery includes a timestamp and
              HMAC-SHA256 signature so receivers can reject stale or modified payloads.
            </p>
            <CodeBlock
              filename="headers"
              code={`Disputr-Timestamp: 1780713600
Disputr-Signature: v1=<hmac_sha256(timestamp.body)>`}
            />
            <p className="mt-4 leading-7 text-muted-foreground">
              Use the Developers page to send a signed test webhook. Each test creates a real delivery log so you can see
              whether your endpoint accepted the request.
            </p>
          </section>

          <section id="webhook-receiver" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Webhook receiver example</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Receivers should verify the timestamp and signature before processing the event. Reject stale timestamps to
              prevent replay attacks.
            </p>
            <CodeBlock
              filename="receiver.ts"
              code={`import { createHmac, timingSafeEqual } from "node:crypto";

function verify(body: string, secret: string, timestamp: string, signature: string) {
  const expected = "v1=" + createHmac("sha256", secret)
    .update(\`\${timestamp}.\${body}\`)
    .digest("hex");

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}`}
            />
          </section>

          <section id="api-reference" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Endpoint reference</h2>
            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
              <div className="grid grid-cols-[90px_1fr_150px] border-b border-border px-5 py-3 text-xs font-extrabold uppercase text-muted-foreground">
                <span>Method</span>
                <span>Path</span>
                <span>Scope</span>
              </div>
              {endpoints.map(([method, path, scope, description]) => (
                <div key={path} className="grid gap-2 border-b border-border px-5 py-4 last:border-b-0 md:grid-cols-[90px_1fr_150px]">
                  <span className="font-mono text-sm font-bold text-primary">{method}</span>
                  <div>
                    <code className="font-mono text-sm font-bold">{path}</code>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{scope}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="deployments" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Deployments</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Info title="Frontend" body="Next.js deploys to Vercel. Browser env values stay prefixed with NEXT_PUBLIC_." />
              <Info title="Backend" body="Hono runs on Cloudflare Workers. Cron handles polling and Queues handle webhook retry jobs." />
            </div>
          </section>

          <section id="error-model" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Error model</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              API responses use stable machine-readable error strings so B2B integrators can build predictable retries and
              operator alerts.
            </p>
            <CodeBlock
              filename="errors.json"
              code={`{
  "unauthorized": "Missing or invalid session/API key",
  "validation_error": "Request body failed schema checks",
  "insufficient_scope": "API key does not include the required scope",
  "not_found": "The requested dispute, webhook, or verdict does not exist",
  "contract_not_configured": "A required GenLayer address is missing"
}`}
            />
          </section>

          <section id="security" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-primary">Security notes</h2>
            <div className="mt-5 space-y-3">
              {[
                "Never store raw private evidence on-chain. Store CIDs and hashes only.",
                "Use scoped API keys and revoke keys immediately when an integration is retired.",
                "Verify webhook signatures and reject stale timestamps before processing events.",
                "Email notifications require SMTP env values and an authenticated sender."
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#176d44]" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">On this page</p>
            <ul className="mt-3 space-y-2 border-l border-border pl-4 text-sm text-muted-foreground">
              {(
                [
                ["Introduction", "#introduction"],
                ["Pricing model", "#pricing-model"],
                ["Evidence CIDs", "#evidence-cids"],
                ["API keys", "#api-keys"],
                ["Webhooks", "#webhooks"],
                ["Endpoint reference", "#api-reference"],
                ["Security", "#security"]
                ] satisfies Array<[string, string]>
              ).map(([item, href]) => (
                <li key={item}>
                  <Link href={href} className="hover:text-primary">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-xl border border-border bg-card p-4 shadow-soft">
              <KeyRound className="size-5 text-primary" />
              <p className="mt-3 text-sm font-bold">Need a key?</p>
              <Link href="/developers" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Open Developers <ArrowRight className="size-4" />
              </Link>
            </div>
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary"
            >
              GenLayer Studio <ExternalLink className="size-4" />
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CodeBlock({ filename, code }: { filename: string; code: string }) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-border bg-[#25130d] shadow-soft">
      <div className="flex items-center gap-2 border-b border-[#4b2819] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#ead1c2]">
        <Webhook className="size-4" />
        {filename}
      </div>
      <pre className="overflow-x-auto p-5 text-sm leading-7 text-[#fff3ea]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
