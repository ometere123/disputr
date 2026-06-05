import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { appealRoutes } from "./routes/appeals.js";
import { credentialRoutes } from "./routes/credentials.js";
import { disputeRoutes } from "./routes/disputes.js";
import { healthRoutes } from "./routes/health.js";
import { verdictRoutes } from "./routes/verdicts.js";
import { webhookRoutes } from "./routes/webhooks.js";
import { attachDb } from "./middleware/db.js";
import { rateLimit } from "./middleware/rate-limit.js";
import { requestId } from "./middleware/request-id.js";
import { securityHeaders } from "./middleware/security.js";
import type { AppEnv } from "./types.js";

export const app = new Hono<AppEnv>();

app.use("*", requestId);
app.use("*", securityHeaders);
app.use("*", attachDb);
app.use("*", async (c, next) =>
  cors({
    origin: c.get("runtimeEnv").FRONTEND_ORIGIN ?? "http://localhost:3000",
    credentials: true
  })(c, next)
);
app.use(
  "/v1/*",
  bodyLimit({
    maxSize: 256 * 1024,
    onError: (c) => c.json({ error: "body_too_large", max_bytes: 256 * 1024 }, 413)
  })
);
app.use("/v1/*", rateLimit);

app.route("/", healthRoutes);
app.route("/", disputeRoutes);
app.route("/", verdictRoutes);
app.route("/", appealRoutes);
app.route("/", credentialRoutes);
app.route("/", webhookRoutes);

app.notFound((c) => c.json({ error: "not_found" }, 404));

app.onError((error, c) => {
  if (error instanceof z.ZodError) {
    return c.json({ error: "validation_error", issues: error.issues }, 400);
  }

  if (error instanceof HTTPException) {
    return c.json({ error: "http_error", message: error.message }, error.status);
  }

  return c.json({ error: "internal_error", request_id: c.get("requestId") }, 500);
});
