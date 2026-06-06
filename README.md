# Disputr

**Decentralized On-Chain Arbitration Protocol**

Disputr is a neutral arbitration layer for smart contract disputes, powered by [GenLayer Intelligent Contracts](https://genlayer.com). It lets escrow products, marketplaces, and DAO treasuries resolve disputes with transparent evidence, structured reasoning, and on-chain finality — without hardcoding trust into a single operator.

- **App:** https://disputr.vercel.app
- **Docs:** https://disputr.vercel.app/docs

---

## What it does

Disputr stores raw evidence off-chain (IPFS via Pinata), commits **evidence CIDs** and **structured verdicts** on-chain, and exposes a B2B API for products that need neutral arbitration.

A dispute flows through four stages:

1. **Open** — Claimant submits plain-text evidence (scope, deliverables, timeline, communications, requested outcome). Disputr packages it into a JSON bundle, uploads to IPFS, and writes the CID to the contract.
2. **Respond** — Respondent submits their own evidence bundle within the response window.
3. **Verdict** — A GenLayer Intelligent Contract weighs both sides and produces a structured verdict: outcome, confidence score, reasoning, and per-evidence weights.
4. **Appeal / Finality** — Either party can stake GEN to appeal through the appeal oracle. Final verdicts mint a soulbound credential NFT to participating wallets.

---

## Two-sided product

**For users**
- Sign in with wallet (SIWE), Google, or magic-link email.
- Open disputes, upload evidence, respond to cases, view verdicts, file appeals.
- Receive soulbound arbitration credentials as a permanent on-chain record.

**For B2B integrators**
- Scoped `dk_` API keys (`read:verdicts`, `write:disputes`, `read:credentials`, `write:webhooks`).
- REST endpoints for opening disputes, reading verdicts, submitting appeals.
- HMAC-SHA256 signed webhooks for `verdict.delivered` events with timestamp replay protection.
- Credential reads by wallet address.

---

## Architecture

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router) on **Vercel** |
| Backend API | Hono on **Cloudflare Workers** with Cron + Queues |
| Contracts | **GenLayer Intelligent Contracts** on StudioNet |
| Database | Postgres via Drizzle ORM |
| Evidence storage | IPFS via Pinata |
| Auth | NextAuth (SIWE + Google + Nodemailer magic-link) |

```
┌──────────────┐         ┌──────────────────┐         ┌────────────────────┐
│  Next.js UI  │ ──────▶ │  Hono on CF      │ ──────▶ │  GenLayer Studio   │
│  (Vercel)    │         │  Workers API     │         │  Intelligent       │
└──────────────┘         │  + Cron + Queue  │         │  Contracts         │
       │                 └──────────────────┘         └────────────────────┘
       │                          │                            │
       ▼                          ▼                            ▼
   NextAuth                   Postgres                    IPFS / Pinata
   (SIWE/Google/Email)        (Drizzle)                   (evidence CIDs)
```

---

## Repository layout

```
disputr/
├── frontend/              Next.js app (Vercel)
│   ├── app/               Routes — dashboard, disputes, developers, settings, docs, sign-in, /api
│   ├── components/        UI + feature components
│   └── lib/               Auth, server helpers, notifications
├── backend/               Hono API on Cloudflare Workers
│   └── src/               Routes, cron, queue handlers
├── intelligent-contracts/ GenLayer Intelligent Contracts (Python)
│   ├── disputr.py             Core arbitration contract
│   ├── disputr_nft.py         Soulbound credential NFT
│   └── appeal_oracle.py       GEN-staked appeals
├── packages/
│   └── db/                Drizzle schema + migrations (shared)
├── infra/                 IaC / deployment config
├── docs/                  api.md, architecture.md, runbook.md, security.md
├── scripts/               env_check, seed, ops helpers
└── tests/                 Static + integration tests
```

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9.15+ (via Corepack)
- A Postgres database
- (Optional) GenLayer StudioNet account, Pinata API key, SMTP credentials, Google OAuth credentials

### Setup

```bash
# Install dependencies
corepack pnpm install

# Copy env templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Run env checks
pnpm env:check

# Apply DB migrations
pnpm --filter @disputr/db migrate

# Start the frontend
pnpm dev

# In another terminal, start the backend Worker
pnpm dev:backend
```

The frontend runs at `http://localhost:3000`, the backend Worker at `http://localhost:8787`.

### Required env variables

**Frontend (`frontend/.env.local`)**

```bash
DATABASE_URL=postgres://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DISPUTR_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_APPEAL_ORACLE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_DISPUTR_API_URL=https://disputr-api.<account>.workers.dev

# Optional providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
EMAIL_SERVER=smtp://user:pass@host:port
EMAIL_FROM="Disputr <noreply@yourdomain.com>"

# Pinata
PINATA_JWT=...
```

**Backend (`backend/.env`)**

```bash
DATABASE_URL=postgres://...
GENLAYER_RPC_URL=https://studio.genlayer.com/api
DISPUTR_CONTRACT_ADDRESS=0x...
WEBHOOK_SIGNING_SECRET=...
```

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Frontend dev server (Next.js) |
| `pnpm dev:backend` | Backend dev (Wrangler) |
| `pnpm build` | Build all workspace packages |
| `pnpm lint` | Lint everything |
| `pnpm typecheck` | Strict TS across all packages |
| `pnpm test` | Static + per-package tests |
| `pnpm env:check` | Validate required env values |
| `pnpm seed` | Seed dev DB |

---

## API at a glance

| Method | Path | Scope | Description |
|---|---|---|---|
| `POST` | `/v1/dispute` | `write:disputes` | Create a dispute record + polling job |
| `GET` | `/v1/dispute/:id` | `read:verdicts` | Read dispute state + verdict |
| `GET` | `/v1/verdict/:id` | `read:verdicts` | Structured verdict reasoning + weights |
| `POST` | `/v1/appeal` | `write:disputes` | Submit appeal + GEN stake metadata |
| `GET` | `/v1/credentials/:address` | `read:credentials` | List soulbound credentials for a wallet |
| `POST` | `/v1/webhooks` | `write:webhooks` | Register a webhook endpoint |

Webhook deliveries include:

```
Disputr-Timestamp: 1780713600
Disputr-Signature: v1=<hmac_sha256(timestamp.body)>
```

Full reference in [`docs/api.md`](docs/api.md) and at [`/docs`](https://disputr.vercel.app/docs).

---

## Security

- Raw private evidence is never stored on-chain — only CIDs and hashes.
- API keys use the `dk_` prefix, are shown once in plaintext, and stored as SHA-256 at rest.
- Webhook receivers verify HMAC-SHA256 signatures and reject stale timestamps to prevent replay.
- CSRF protection via origin/referer check on all mutating API routes.
- Standard hardening headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

See [`docs/security.md`](docs/security.md).

---

## Deployment

- **Frontend** → Vercel (auto-deploys from `main`).
- **Backend** → Cloudflare Workers via `wrangler deploy`.
- **Contracts** → Deployed manually to GenLayer StudioNet; addresses configured via env.

See [`docs/runbook.md`](docs/runbook.md) for operational procedures.

---

## Status

StudioNet beta. Production billing and mainnet fee settlement are gated behind GenLayer mainnet readiness.

---

## License

MIT
