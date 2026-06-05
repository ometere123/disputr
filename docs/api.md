# Disputr API

All B2B endpoints are under `/v1` and require `Authorization: Bearer dk_...`.

## Scopes

- `read:verdicts`
- `write:disputes`
- `read:credentials`
- `write:webhooks`

## Endpoints

| Method | Path | Scope | Purpose |
| --- | --- | --- | --- |
| POST | `/v1/dispute` | `write:disputes` | Open a dispute with parties, evidence CID, optional scope CID, and native GEN stake (`stake_gen`). |
| GET | `/v1/dispute/:id` | `read:verdicts` | Fetch dispute status and verdict if resolved. |
| GET | `/v1/verdict/:id` | `read:verdicts` | Fetch structured verdict, reasoning trace, confidence, and evidence weights. |
| POST | `/v1/appeal` | `write:disputes` | Submit native GEN stake-backed appeal evidence (`stake_gen`). |
| GET | `/v1/credentials/:address` | `read:credentials` | List soulbound dispute credentials for a wallet. |
| POST | `/v1/webhooks` | `write:webhooks` | Register an HTTPS webhook endpoint for `verdict.delivered`. |

## Webhook Headers

- `Disputr-Timestamp`: Unix timestamp.
- `Disputr-Signature`: `v1=` prefixed HMAC-SHA256 signature over `timestamp.body`.

Reject stale timestamps and verify signatures before acting on webhook payloads.
