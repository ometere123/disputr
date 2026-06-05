# Runbook

## Install

```bash
pnpm install
```

## Local Development

```bash
pnpm dev
pnpm dev:backend
```

The backend command runs `wrangler dev` from `backend/`.

## Verify

```bash
pnpm env:check
pnpm typecheck
pnpm build
pnpm test
```

## Vercel

Use the repository root as the Vercel project root. The checked-in `vercel.json` installs with pnpm and builds the frontend via:

```bash
pnpm --filter @disputr/frontend build
```

Set the frontend env values in Vercel. Leave contract address env values empty until deployed addresses are provided.

## Cloudflare Workers Backend

The backend deploy target is Cloudflare Workers. Do not deploy until contract and production env values are ready.

Local Worker dev:

```bash
pnpm --filter @disputr/backend dev
```

Deploy command, when explicitly approved later:

```bash
pnpm --filter @disputr/backend deploy
```

Configure secrets with Wrangler for:

- `DATABASE_URL`
- `PINATA_JWT`
- `PINATA_GATEWAY`
- `AUTH_SECRET`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` if using Upstash rate limits
- contract address env values after manual GenLayer deployment

The Worker uses Cloudflare Cron Triggers for scheduled dispute polling and Cloudflare Queues for webhook delivery retries. It is not an always-running server.

## Contract Deployment

Deploy the GenLayer contracts manually in this order:

1. `intelligent-contracts/disputr.py`
2. `intelligent-contracts/disputr_nft.py`
3. `intelligent-contracts/appeal_oracle.py`

After deployment, update the environment variables with the deployed addresses. Do not redeploy from the app unless explicitly requested.
