import { credentials } from "@disputr/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { requireApiKey } from "../middleware/api-key.js";
import type { AppEnv } from "../types.js";

export const credentialRoutes = new Hono<AppEnv>().get(
  "/v1/credentials/:address",
  requireApiKey("read:credentials"),
  async (c) => {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "database_not_configured" }, 503);
    }

    const address = c.req.param("address");
    const rows = await db.select().from(credentials).where(eq(credentials.walletAddress, address)).limit(100);

    return c.json({ credentials: rows });
  }
);
