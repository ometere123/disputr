import { verdicts } from "@disputr/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { requireApiKey } from "../middleware/api-key.js";
import { audit } from "../services/audit.js";
import type { AppEnv } from "../types.js";

export const verdictRoutes = new Hono<AppEnv>().get("/v1/verdict/:id", requireApiKey("read:verdicts"), async (c) => {
  const db = c.get("db");
  if (!db) {
    return c.json({ error: "database_not_configured" }, 503);
  }

  const id = c.req.param("id");
  const [verdict] = await db.select().from(verdicts).where(eq(verdicts.id, id)).limit(1);
  if (!verdict) {
    return c.json({ error: "not_found" }, 404);
  }

  await audit(c, { action: "verdict.read", resourceType: "verdict", resourceId: id });
  return c.json({ verdict });
});
