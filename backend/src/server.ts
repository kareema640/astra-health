import { createApp } from "./app";
import { env } from "./env";
import { pool } from "./db";
import { runMigrations } from "./db/migrate";

const app = createApp();

async function boot() {
  // Idempotent, tracked in schema_migrations — safe on every start.
  const applied = await runMigrations(env.DATABASE_URL);
  if (applied.length) console.log(`[migrate] applied ${applied.join(", ")}`);
  const server = app.listen(env.PORT, () => {
    console.log(`ASTRA HEALTH API listening on http://localhost:${env.PORT}`);
  });
  async function shutdown(signal: string) {
    console.log(`\n${signal}: closing server`);
    server.close();
    await pool.end();
    process.exit(0);
  }
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

void boot().catch((err) => {
  console.error("boot failed:", err);
  process.exit(1);
});
