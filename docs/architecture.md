# Disputr Architecture

Disputr is a monorepo with a Vercel frontend, Cloudflare Workers Hono API, shared Drizzle schema, Supabase Postgres, and three GenLayer Intelligent Contracts.

## Runtime Surfaces

- `frontend`: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, Auth.js v5, SIWE, wagmi injected-wallet connection, and GenLayer client configuration.
- `backend`: Hono on Cloudflare Workers with REST routes, scoped API key auth, Redis rate limits, webhook registration, HMAC signing, Queue-backed webhook retries, Cron-based dispute polling, and Pinata-backed IPFS upload support.
- `packages/db`: Drizzle ORM Postgres schema and Supabase Postgres client configuration using the Worker-compatible `postgres` driver with prepared statements disabled for pooler compatibility.
- `intelligent-contracts`: GenLayer Python contracts for arbitration, soulbound credentials, and appeals.

## Product Surfaces

Disputr has two connected surfaces:

- User app: wallet/SIWE sign-in, profile settings, notifications, dispute filing, response evidence, appeals, verdicts, and credentials.
- B2B developer platform: `dk_` API keys, scoped `/v1/*` access, webhook registration, HMAC-signed verdict delivery, and delivery retries.

The user app uses session-authenticated Next.js routes under `/api/me/*`. External integrations use the Cloudflare Worker `/v1/*` API with API key authentication.

## Cloudflare Worker Events

Workers are request/event based, not an always-running VPS. Disputr uses:

- `fetch`: Hono REST API requests.
- `scheduled`: Cloudflare Cron Trigger for unresolved dispute polling.
- `queue`: Cloudflare Queues for webhook delivery and retry work.

The previous 5-second in-process poller is intentionally replaced with Cloudflare-native event handlers. Durable Object alarms can be added later if exact per-dispute response window wakeups are needed.

## Database

`DATABASE_URL` points to Supabase Postgres. For Cloudflare Workers, use either a Supabase pooler connection string with prepared statements disabled or a Cloudflare Hyperdrive connection to Supabase Postgres.

Run `packages/db/migrations/0001_account_notifications.sql` before using wallet sign-in, settings, notifications, API keys, or webhooks in production.

## Contract Configuration

Contract addresses are centralized in environment variables:

- `NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_DISPUTR_NFT_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_APPEAL_ORACLE_CONTRACT_ADDRESS`

Before deployment, the UI and API show a contract-not-configured state and avoid hardcoded addresses. After deployment, update only env/config values.

## GenLayer StudioNet

- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Network: `GenLayer StudioNet`

The frontend uses wagmi for injected EVM wallet connection and keeps GenLayer write helpers behind centralized config.
