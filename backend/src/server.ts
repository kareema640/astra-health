import { createApp } from "./app";
import { env } from "./env";
import { pool } from "./db";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`ASTRA HEALTH auth API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal}: closing server`);
  server.close();
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
