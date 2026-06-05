import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createMiddleware } from "hono/factory";
import type { RuntimeEnv } from "../env.js";
import type { AppEnv } from "../types.js";

const memoryHits = new Map<string, { count: number; resetAt: number }>();
const redisLimits = new Map<string, Ratelimit>();

function getRedisLimit(runtimeEnv: RuntimeEnv) {
  const url = runtimeEnv.UPSTASH_REDIS_REST_URL;
  const token = runtimeEnv.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return undefined;
  }

  const cacheKey = `${url}:${token.slice(0, 8)}`;
  const cached = redisLimits.get(cacheKey);
  if (cached) {
    return cached;
  }

  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(120, "1 m"),
    analytics: true
  });
  redisLimits.set(cacheKey, limiter);
  return limiter;
}

export const rateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const key = c.req.header("authorization") ?? c.req.header("x-forwarded-for") ?? "anonymous";
  const redisLimit = getRedisLimit(c.get("runtimeEnv"));

  if (redisLimit) {
    const result = await redisLimit.limit(key);
    c.header("x-ratelimit-limit", String(result.limit));
    c.header("x-ratelimit-remaining", String(result.remaining));
    c.header("x-ratelimit-reset", String(result.reset));

    if (!result.success) {
      return c.json({ error: "rate_limit_exceeded" }, 429);
    }

    await next();
    return;
  }

  const now = Date.now();
  const bucket = memoryHits.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + 60_000 });
    await next();
    return;
  }

  bucket.count += 1;
  if (bucket.count > 60) {
    return c.json({ error: "rate_limit_exceeded" }, 429);
  }

  await next();
});
