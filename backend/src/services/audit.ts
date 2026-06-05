import { auditLog } from "@disputr/db";
import type { Context } from "hono";
import type { AppEnv } from "../types.js";

export async function audit(c: Context<AppEnv>, input: { action: string; resourceType: string; resourceId?: string }) {
  const db = c.get("db");
  if (!db) {
    return;
  }

  const identity = c.get("apiIdentity");
  await db.insert(auditLog).values({
    actorId: identity?.userId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    ip: c.req.header("x-forwarded-for"),
    userAgent: c.req.header("user-agent")
  });
}
