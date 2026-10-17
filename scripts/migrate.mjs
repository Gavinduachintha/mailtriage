import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = await readFile(join(dirname(fileURLToPath(import.meta.url)), "..", "db", "schema.sql"), "utf8");
const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(sql);
  console.log("Applied db/schema.sql");
} finally {
  await client.end();
}
