import { Hono } from "hono";
import type { AppEnv } from "../types.js";

export const healthRoutes = new Hono<AppEnv>().get("/health", (c) =>
  c.json({
    ok: true,
    service: "disputr-api",
    request_id: c.get("requestId")
  })
);
