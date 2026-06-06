# Security Model

## API Keys

Developer keys use a `dk_` prefix. Plaintext is shown once at creation and the backend stores only a SHA-256 hash. Each key carries explicit scopes.

Session-authenticated `/api/me/api-keys` is only used to create and manage a logged-in user's own keys. External API access still requires the `dk_` bearer token on Cloudflare Worker `/v1/*` routes.

## Evidence Integrity

Raw private evidence is stored off-chain on IPFS through Pinata. Contracts receive CIDs and hashes only.

## Rate Limits

`/v1/*` routes are covered by Redis sliding-window rate limits when Upstash Redis is configured through HTTP-compatible Worker bindings. A conservative in-memory limiter protects local development only.

## Webhooks

Webhook deliveries are signed with HMAC-SHA256 using a per-webhook secret. Timestamp headers support replay protection. Delivery records are processed by Cloudflare Queues with retry and dead-letter handling.

## Frontend

The app separates public env values from server secrets, avoids Node-only APIs in browser components, and uses request origin checks for mutating API route handlers.

Profile settings, notification reads, API keys, webhooks, and user disputes are scoped to the current Auth.js session. Wallet login uses SIWE and stores linked wallets in Supabase.

## Workers

The backend runs on Cloudflare Workers. Worker code uses request, scheduled, and queue events rather than in-process loops. Node compatibility is enabled for dependencies that need supported Node APIs.

## Headers

The frontend and backend set frame, content-type, referrer, and transport security headers.
