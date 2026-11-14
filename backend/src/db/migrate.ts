import fs from "node:fs";
import path from "node:path";
import pg from "pg";

/** Ordered list of migration files (lexicographic by filename). */
export function migrationFiles(dir = path.resolve(import.meta.dirname, "migrations")): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => path.join(dir, f));
}

/**
 * Apply every not-yet-applied migration, each inside its own transaction,
 * tracked in schema_migrations. Idempotent and safe to run at boot or in CI.
 * Returns the list of filenames applied in this call.
 */
export async function runMigrations(connectionString: string): Promise<string[]> {
  const client = new pg.Client({ connectionString });
  await client.connect();
  const applied: string[] = [];
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         filename   text PRIMARY KEY,
         applied_at timestamptz NOT NULL DEFAULT now()
       )`,
    );
    for (const file of migrationFiles()) {
      const name = path.basename(file);
      const done = await client.query("SELECT 1 FROM schema_migrations WHERE filename = $1", [name]);
      if (done.rowCount) continue;
      const sql = fs.readFileSync(file, "utf8");
      // The runner owns the transaction; older files (001) contain their own
      // BEGIN/COMMIT wrapper — strip bare transaction statements.
      const body = sql.replace(/^\s*(?:BEGIN|COMMIT)\s*;\s*$/gim, "");
      try {
        await client.query("BEGIN");
        await client.query(body);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [name]);
        await client.query("COMMIT");
        applied.push(name);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${name} failed: ${(err as Error).message}`);
      }
    }
  } finally {
    await client.end();
  }
  return applied;
}

// CLI entry: `bun src/db/migrate.ts` — uses DATABASE_URL from the environment.
if (import.meta.main) {
  const url = process.env["DATABASE_URL"];
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const files = await runMigrations(url);
  console.log(files.length ? `applied: ${files.join(", ")}` : "already up to date");
}
