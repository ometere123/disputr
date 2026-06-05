import { createDb, disputes, jobs } from "@disputr/db";
import { and, inArray, lt } from "drizzle-orm";
import { getRuntimeEnv } from "./env.js";
import { isDisputrContractConfigured } from "./lib/genlayer.js";
import { deliverQueuedWebhook } from "./services/webhooks.js";
import type { WorkerBindings } from "./types.js";

export async function handleScheduled(_controller: ScheduledController, env: WorkerBindings, ctx: ExecutionContext) {
  ctx.waitUntil(pollUnresolvedDisputes(env));
}

export async function handleQueue(batch: MessageBatch<unknown>, env: WorkerBindings) {
  const runtimeEnv = getRuntimeEnv(env);
  if (!runtimeEnv.DATABASE_URL) {
    for (const message of batch.messages) {
      message.retry();
    }
    return;
  }

  const db = createDb(runtimeEnv.DATABASE_URL);

  for (const message of batch.messages) {
    const body = message.body as { deliveryId?: unknown };
    if (typeof body.deliveryId !== "string") {
      message.ack();
      continue;
    }

    try {
      await deliverQueuedWebhook(db, body.deliveryId);
      message.ack();
    } catch {
      message.retry();
    }
  }
}

async function pollUnresolvedDisputes(env: WorkerBindings) {
  const runtimeEnv = getRuntimeEnv(env);
  if (!runtimeEnv.DATABASE_URL || !isDisputrContractConfigured(runtimeEnv)) {
    return;
  }

  const db = createDb(runtimeEnv.DATABASE_URL);
  const dueDisputes = await db
    .select()
    .from(disputes)
    .where(
      and(
        inArray(disputes.status, ["pending_response", "ready_for_evaluation", "appealed"]),
        lt(disputes.updatedAt, new Date(Date.now() - 60_000))
      )
    )
    .limit(25);

  for (const dispute of dueDisputes) {
    await db.insert(jobs).values({
      disputeId: dispute.id,
      type: "poll_dispute_state",
      status: "queued"
    });
  }
}
