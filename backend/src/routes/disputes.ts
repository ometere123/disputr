import { disputes, jobs, verdicts } from "@disputr/db";
import { desc, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { audit } from "../services/audit.js";
import { getGenLayerConfig, isDisputrContractConfigured } from "../lib/genlayer.js";
import { requireApiKey } from "../middleware/api-key.js";
import type { AppEnv } from "../types.js";

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Expected an EVM address");
const cidSchema = z.string().min(10).max(128);

const createDisputeSchema = z.object({
  escrow_address: addressSchema,
  claimant: addressSchema,
  respondent: addressSchema,
  evidence_bundle_hash: cidSchema,
  scope_doc_hash: cidSchema.optional(),
  stake_gen: z.string().regex(/^\d+(\.\d{1,18})?$/).default("0")
});

const responseSchema = z.object({
  respondent_cid: cidSchema
});

function disputeId() {
  return `dsp_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

export const disputeRoutes = new Hono<AppEnv>()
  .post("/v1/dispute", requireApiKey("write:disputes"), async (c) => {
    const body = createDisputeSchema.parse(await c.req.json());
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "database_not_configured" }, 503);
    }

    const id = disputeId();
    const appealWindow = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const runtimeEnv = c.get("runtimeEnv");
    const genlayerConfig = getGenLayerConfig(runtimeEnv);

    await db.insert(disputes).values({
      id,
      escrowAddress: body.escrow_address,
      claimant: body.claimant,
      respondent: body.respondent,
      claimantCid: body.evidence_bundle_hash,
      scopeDocHash: body.scope_doc_hash,
      stakeGen: body.stake_gen,
      appealWindowExpires: appealWindow,
      status: "pending_response"
    });
    await db.insert(jobs).values({ disputeId: id, type: "poll_dispute_state", status: "queued" });
    await audit(c, { action: "dispute.created", resourceType: "dispute", resourceId: id });

    return c.json(
      {
        id,
        status: "pending_response",
        contract: isDisputrContractConfigured(runtimeEnv)
          ? { configured: true, address: genlayerConfig.contracts.disputr }
          : { configured: false, message: "Contract not configured. Add NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS after deployment." }
      },
      201
    );
  })
  .get("/v1/dispute/:id", requireApiKey("read:verdicts"), async (c) => {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "database_not_configured" }, 503);
    }

    const id = c.req.param("id");
    const [dispute] = await db.select().from(disputes).where(eq(disputes.id, id)).limit(1);
    if (!dispute) {
      return c.json({ error: "not_found" }, 404);
    }

    const [verdict] = await db.select().from(verdicts).where(eq(verdicts.disputeId, id)).limit(1);
    await audit(c, { action: "dispute.read", resourceType: "dispute", resourceId: id });

    return c.json({ dispute, verdict: verdict ?? null });
  })
  .post("/v1/dispute/:id/response", requireApiKey("write:disputes"), async (c) => {
    const body = responseSchema.parse(await c.req.json());
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "database_not_configured" }, 503);
    }

    const id = c.req.param("id");
    const [updated] = await db
      .update(disputes)
      .set({ respondentCid: body.respondent_cid, status: "ready_for_evaluation", updatedAt: new Date() })
      .where(eq(disputes.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "not_found" }, 404);
    }

    await audit(c, { action: "dispute.response_submitted", resourceType: "dispute", resourceId: id });
    return c.json({ dispute: updated });
  })
  .get("/v1/disputes", requireApiKey("read:verdicts"), async (c) => {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "database_not_configured" }, 503);
    }

    const address = c.req.query("address");
    const rows = await db
      .select()
      .from(disputes)
      .where(address ? or(eq(disputes.claimant, address), eq(disputes.respondent, address)) : undefined)
      .orderBy(desc(disputes.createdAt))
      .limit(50);

    return c.json({ disputes: rows });
  });
