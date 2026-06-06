import { createDb, type DbClient } from "@disputr/db";

let db: DbClient | null = null;

export function getDb() {
  if (db) {
    return db;
  }

  db = createDb(process.env.DATABASE_URL);
  return db;
}
