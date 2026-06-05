import { webhooks } from "@disputr/db";
import { Hono } from "hono";
import { z } from "zod";
import { generateWebhookSecret } from "../lib/crypto.js";
import { requireApiKey } from "../middleware/api-key.js";
import { audit } from "../services/audit.js";
import type { AppEnv } from "../types.js";

const webhookSchema = z.object({
  url: z.string().url().refine((url) => url.startsWith("https://"), "Webhook URLs must use HTTPS"),
  events: z.array(z.literal("verdict.delivered")).min(1).default(["verdict.delivered"])
});

export const webhookRoutes = new Hono<AppEnv>().post("/v1/webhooks", requireApiKey("write:webhooks"), async (c) => {
  const body = webhookSchema.parse(await c.req.json());
  const db = c.get("db");
  const identity = c.get("apiIdentity");

  if (!db || !identity) {
    return c.json({ error: "database_not_configured" }, 503);
  }

  const secret = generateWebhookSecret();
  const [record] = await db
    .insert(webhooks)
    .values({
      userId: identity.userId,
      url: body.url,
      secret,
      events: body.events,
      active: true
    })
    .returning();

  if (!record) {
    return c.json({ error: "webhook_create_failed" }, 500);
  }

  await audit(c, { action: "webhook.created", resourceType: "webhook", resourceId: record.id });
  return c.json({ webhook: record, signing_secret: secret, note: "Store this secret now. It is only returned once." }, 201);
});
