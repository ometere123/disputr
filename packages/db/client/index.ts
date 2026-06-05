import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema/index.js";

export function createDb(databaseUrl?: string) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a database client");
  }

  const client = postgres(databaseUrl, {
    max: 1,
    prepare: false
  });

  return drizzle(client, { schema });
}

export type DbClient = ReturnType<typeof createDb>;
