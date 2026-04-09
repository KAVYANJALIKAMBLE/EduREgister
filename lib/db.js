import "dotenv/config";
import { Pool } from "pg";

const globalForDb = globalThis;

const pool =
  globalForDb.__eduregisterPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__eduregisterPool = pool;
}

export async function query(sql, params = []) {
  return pool.query(sql, params);
}
