import { createDb } from "@disputr/db";
import { createMiddleware } from "hono/factory";
import { getRuntimeEnv } from "../env.js";
import type { AppEnv } from "../types.js";

const dbClients = new Map<string, ReturnType<typeof createDb>>();

export const attachDb = createMiddleware<AppEnv>(async (c, next) => {
  const runtimeEnv = getRuntimeEnv(c.env);
  c.set("runtimeEnv", runtimeEnv);

  const databaseUrl = runtimeEnv.DATABASE_URL;
  const db = databaseUrl
    ? dbClients.get(databaseUrl) ?? (() => {
        const client = createDb(databaseUrl);
        dbClients.set(databaseUrl, client);
        return client;
      })()
    : undefined;

  c.set("db", db);
  await next();
});
