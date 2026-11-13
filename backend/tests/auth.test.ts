import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import pg from "pg";

import { createApp } from "../src/app";

const app = createApp();
let client: pg.Client;

const valid = {
  fullName: "Sarah Chen",
  email: "s.chen@astracorps.example",
  password: "Secret123!",
  confirmPassword: "Secret123!",
  astronautId: "AST-0114",
};

beforeAll(async () => {
  client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const migration = fs.readFileSync(
    path.resolve(import.meta.dirname, "../src/db/migrations/001_auth.sql"),
    "utf8",
  );
  await client.query(migration);
  await client.query("TRUNCATE users CASCADE");
});

afterEach(async () => {
  await client.query("TRUNCATE users CASCADE");
});

describe("POST /api/auth/register", () => {
  it("registers a new user and returns tokens (successful registration)", async () => {
    const res = await request(app).post("/api/auth/register").send(valid).expect(201);
    expect(res.body.user).toMatchObject({
      fullName: "Sarah Chen",
      email: "s.chen@astracorps.example",
      astronautId: "AST-0114",
    });
    expect(res.body.accessToken).toBeTypeOf("string");
    expect(res.body.refreshToken).toBeTypeOf("string");
  });

  it("persists the account with a bcrypt hash, never plaintext (database persistence)", async () => {
    await request(app).post("/api/auth/register").send(valid).expect(201);
    const { rows } = await client.query(
      "SELECT email, password_hash, astronaut_id FROM users WHERE lower(email) = $1",
      [valid.email.toLowerCase()],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$/);
    expect(rows[0].password_hash).not.toContain(valid.password);
  });

  it("rejects a duplicate email, case-insensitively (duplicate email registration)", async () => {
    await request(app).post("/api/auth/register").send(valid).expect(201);
    const dup = { ...valid, email: "S.CHEN@astracorps.EXAMPLE", astronautId: "AST-9999" };
    const res = await request(app).post("/api/auth/register").send(dup).expect(409);
    expect(res.body.error.code).toBe("EMAIL_EXISTS");
  });

  it("rejects a duplicate Astronaut ID", async () => {
    await request(app).post("/api/auth/register").send(valid).expect(201);
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...valid, email: "other@x.example" })
      .expect(409);
    expect(res.body.error.code).toBe("ASTRONAUT_ID_EXISTS");
  });

  it("rejects an invalid email (invalid email)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...valid, email: "not-an-email" })
      .expect(400);
    expect(res.body.error.code).toBe("VALIDATION");
    expect(res.body.error.fields.email).toBeTruthy();
  });

  it("rejects missing required fields (missing required fields)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: valid.email })
      .expect(400);
    expect(res.body.error.fields).toMatchObject({ fullName: expect.any(String) });
  });

  it("rejects weak and mismatched passwords (invalid passwords)", async () => {
    const short = await request(app)
      .post("/api/auth/register")
      .send({ ...valid, password: "abc1", confirmPassword: "abc1" })
      .expect(400);
    expect(short.body.error.fields.password).toMatch(/at least 8/);
    const noDigit = await request(app)
      .post("/api/auth/register")
      .send({ ...valid, password: "abcdefgh", confirmPassword: "abcdefgh" })
      .expect(400);
    expect(noDigit.body.error.fields.password).toMatch(/number/);
    const mismatch = await request(app)
      .post("/api/auth/register")
      .send({ ...valid, confirmPassword: "Different123" })
      .expect(400);
    expect(mismatch.body.error.fields.confirmPassword).toMatch(/match/);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(valid).expect(201);
  });

  it("logs in with Astronaut ID + correct password (successful login)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ astronautId: valid.astronautId, password: valid.password })
      .expect(200);
    expect(res.body.user.astronautId).toBe("AST-0114");
    expect(res.body.accessToken).toBeTypeOf("string");
  });

  it("also accepts the registered email as identifier", async () => {
    await request(app)
      .post("/api/auth/login")
      .send({ astronautId: valid.email, password: valid.password })
      .expect(200);
  });

  it("rejects an incorrect password (incorrect password)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ astronautId: valid.astronautId, password: "WrongPass123" })
      .expect(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects an unregistered identifier without leaking why (unregistered email)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ astronautId: "nobody@nowhere.example", password: "Whatever123" })
      .expect(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});

describe("Session lifecycle", () => {
  it("protects /me with the access token", async () => {
    const reg = await request(app).post("/api/auth/register").send(valid).expect(201);
    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${reg.body.accessToken}`)
      .expect(200);
    expect(me.body.user.email).toBe(valid.email.toLowerCase());
    await request(app).get("/api/auth/me").expect(401);
  });

  it("rotates refresh tokens and invalidates the old one", async () => {
    const reg = await request(app).post("/api/auth/register").send(valid).expect(201);
    const refreshed = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: reg.body.refreshToken })
      .expect(200);
    expect(refreshed.body.refreshToken).not.toBe(reg.body.refreshToken);
    // Replaying the spent token fails.
    await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: reg.body.refreshToken })
      .expect(401);
  });

  it("logout revokes the session so refresh stops working (logout)", async () => {
    const reg = await request(app).post("/api/auth/register").send(valid).expect(201);
    await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken: reg.body.refreshToken })
      .expect(204);
    await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: reg.body.refreshToken })
      .expect(401);
    const { rows } = await client.query("SELECT revoked_at FROM sessions LIMIT 1");
    expect(rows[0].revoked_at).not.toBeNull();
  });
});

describe("Service health", () => {
  it("GET /api/health responds ok", async () => {
    await request(app).get("/api/health").expect(200);
  });
});
