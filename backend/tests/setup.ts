import fs from "node:fs";
import path from "node:path";

process.env.NODE_ENV = "test";

const file = path.resolve(import.meta.dirname, "../.env.test");
if (fs.existsSync(file)) {
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]!] === undefined) process.env[m[1]!] = m[2];
  }
}

// Fallbacks keep the vitest config importable, but real credentials belong in
// backend/.env.test (never committed): DATABASE_URL_TEST=postgresql://USER:PASSWORD@localhost:5432/astra_health_test
process.env.DATABASE_URL ??=
  process.env.DATABASE_URL_TEST ?? "postgresql://postgres@localhost:5432/astra_health_test";
process.env.JWT_SECRET ??= "vitest-only-secret-please-replace-in-real-deployments-000000";
process.env.CORS_ORIGINS ??= "http://localhost:5173";
