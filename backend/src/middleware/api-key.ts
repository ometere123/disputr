import { apiKeys, type ApiScope } from "@disputr/db";
import { and, eq, isNull } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { hashApiKey } from "../lib/crypto.js";
import type { AppEnv } from "../types.js";

export function requireApiKey(scope: ApiScope) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const authorization = c.req.header("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";

    if (!token || !token.startsWith("dk_")) {
      return c.json({ error: "invalid_api_key", message: "A dk_ bearer token is required." }, 401);
    }

    const db = c.get("db");
    if (!db) {
      return c.json({ error: "database_not_configured", message: "API key validation requires DATABASE_URL." }, 503);
    }

    const keyHash = hashApiKey(token);
    const [record] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
      .limit(1);

    if (!record || !record.scopes.includes(scope)) {
      return c.json({ error: "insufficient_scope", required_scope: scope }, 403);
    }

    await db.update(apiKeys).set({ lastUsed: new Date() }).where(eq(apiKeys.id, record.id));

    c.set("apiIdentity", {
      id: record.id,
      userId: record.userId,
      scopes: record.scopes
    });
    await next();
  });
}
