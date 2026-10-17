import { Pool } from "pg";

const globalForDb = globalThis as unknown as {
  mailtriagePool?: Pool;
  mailtriagePoolUrl?: string;
};

/** One pool per Node process. Recreated if DATABASE_URL changes (Next.js env reload). */
export function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (globalForDb.mailtriagePool && globalForDb.mailtriagePoolUrl === connectionString) {
    return globalForDb.mailtriagePool;
  }

  void globalForDb.mailtriagePool?.end();

  const url = new URL(connectionString);
  globalForDb.mailtriagePool = new Pool({
    host: url.hostname === "localhost" ? "127.0.0.1" : url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    max: 10,
  });
  globalForDb.mailtriagePoolUrl = connectionString;
  return globalForDb.mailtriagePool;
}
