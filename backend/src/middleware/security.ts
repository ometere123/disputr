import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types.js";

export const securityHeaders = createMiddleware<AppEnv>(async (c, next) => {
  await next();
  c.header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  c.header("X-Frame-Options", "DENY");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "no-referrer");
});
