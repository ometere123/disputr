import { appeals, disputes } from "@disputr/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { requireApiKey } from "../middleware/api-key.js";
import { audit } from "../services/audit.js";
import type { AppEnv } from "../types.js";

const appealSchema = z.object({
  dispute_id: z.string().min(4),
  appellant: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  appeal_cid: z.string().min(10).max(128),
  stake_gen: z.string().regex(/^\d+(\.\d{1,18})?$/)
});

export const appealRoutes = new Hono<AppEnv>().post("/v1/appeal", requireApiKey("write:disputes"), async (c) => {
  const body = appealSchema.parse(await c.req.json());
  const db = c.get("db");
  if (!db) {
    return c.json({ error: "database_not_configured" }, 503);
  }

  const [dispute] = await db.select().from(disputes).where(eq(disputes.id, body.dispute_id)).limit(1);
  if (!dispute) {
    return c.json({ error: "not_found" }, 404);
  }

  if (dispute.appealWindowExpires && dispute.appealWindowExpires.getTime() < Date.now()) {
    return c.json({ error: "appeal_window_closed" }, 409);
  }

  const id = `apl_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
  await db.insert(appeals).values({
    id,
    disputeId: body.dispute_id,
    appellant: body.appellant,
    appealCid: body.appeal_cid,
    stakeGen: body.stake_gen,
    status: "pending"
  });
  await db.update(disputes).set({ status: "appealed", updatedAt: new Date() }).where(eq(disputes.id, body.dispute_id));
  await audit(c, { action: "appeal.created", resourceType: "appeal", resourceId: id });

  return c.json({ id, status: "pending" }, 201);
});
