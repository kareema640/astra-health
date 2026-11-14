import type { Express } from "express";
import pg from "pg";
import request from "supertest";
import { createApp } from "../src/app";
import { runMigrations } from "../src/db/migrate";

export const app: Express = createApp();
export let client: pg.Client;

export async function setupDb() {
  await runMigrations(process.env.DATABASE_URL!);
  client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
}

export async function teardownDb() {
  await client.end();
}

/** Order matters: cascade covers sessions, astronauts and every fact table. */
export async function wipe() {
  await client.query("TRUNCATE users, missions CASCADE");
}

let seq = 0;
/** Registers a fresh account and returns it plus an Authorization header. */
export async function newUser(overrides: Partial<Record<"fullName" | "email" | "astronautId" | "password", string>> = {}) {
  seq += 1;
  const password = overrides.password ?? "Secret123!";
  const body = {
    fullName: overrides.fullName ?? `Test Astronaut ${seq}`,
    email: overrides.email ?? `test${seq}@astra.test`,
    astronautId: overrides.astronautId ?? `AST-T${String(seq).padStart(4, "0")}`,
    password,
    confirmPassword: password,
    ...overrides,
  };
  const res = await request(app).post("/api/auth/register").send(body).expect(201);
  return {
    ...body,
    accessToken: res.body.accessToken as string,
    auth: { Authorization: `Bearer ${res.body.accessToken}` },
  };
}

/** Full onboarding sync as the frontend would send it. */
export async function syncUser(user: Awaited<ReturnType<typeof newUser>>, snapshot: object) {
  return request(app).post("/api/onboarding/sync").set(user.auth).send(snapshot);
}
