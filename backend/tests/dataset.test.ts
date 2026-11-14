import { afterAll, beforeAll, describe, expect, it } from "vitest";
import path from "node:path";
import request from "supertest";
import { app, client, newUser, setupDb, teardownDb, wipe } from "./helpers";
import { importDataset } from "../scripts/import-dataset";

const FIXTURE = path.resolve(import.meta.dirname, "fixtures/mini-dataset.csv");

beforeAll(async () => {
  await setupDb();
  await wipe();
  await importDataset(FIXTURE, process.env.DATABASE_URL!, () => {});
});
afterAll(teardownDb);

describe("simulated dataset import (mini fixture)", () => {
  it("creates the mission with phases and a simulated cohort", async () => {
    const m = await client.query("SELECT id, code, start_date, end_date FROM missions WHERE code='ASTRA-SIM-2026'");
    expect(m.rows).toHaveLength(1);
    const p = await client.query("SELECT count(*)::int AS n FROM mission_phases");
    expect(p.rows[0].n).toBeGreaterThan(0);
    const a = await client.query("SELECT kind FROM astronauts WHERE designator='SIM-001'");
    expect(a.rows[0]?.kind).toBe("simulated");
  });

  it("partitions grains correctly: 3 samples → 3 vitals, 1 sleep day, 1 episode", async () => {
    const v = await client.query("SELECT count(*)::int AS n FROM vital_observations WHERE is_synthetic");
    expect(v.rows[0].n).toBe(3);
    const s = await client.query("SELECT count(*)::int AS n FROM sleep_summaries WHERE is_synthetic");
    expect(s.rows[0].n).toBe(1); // 8×-repeated daily values collapsed to one row
    const e = await client.query("SELECT severity_max FROM illness_episodes WHERE is_synthetic");
    expect(e.rows).toHaveLength(1);
    expect(e.rows[0].severity_max).toBe("0.620");
    const ev = await client.query("SELECT count(DISTINCT kind)::int AS kinds FROM mission_events WHERE is_synthetic");
    expect(ev.rows[0].kinds).toBe(3);
  });

  it("cabin environment is station-scoped (one row per timestamp)", async () => {
    const n = await client.query("SELECT count(*)::int AS n FROM environment_observations");
    expect(n.rows[0].n).toBe(3);
  });

  it("serves the cohort through /api/dataset only to signed-in users", async () => {
    await request(app).get("/api/dataset/astronauts").expect(401);
    const user = await newUser();
    const list = await request(app).get("/api/dataset/astronauts").set(user.auth).expect(200);
    expect(list.body.simulated).toBe(true);
    expect(list.body.astronauts.some((a: { astronautId: string }) => a.astronautId === "SIM-001")).toBe(true);

    const obs = await request(app)
      .get("/api/dataset/astronauts/SIM-001/observations")
      .set(user.auth)
      .expect(200);
    expect(obs.body.simulated).toBe(true);
    expect(obs.body.count).toBe(3);
    expect(obs.body.samples[0]).toHaveProperty("cabinCo2Ppm");
    expect(obs.body.samples[0].sourceTemplate).toMatch(/^ASTRA-00/);

    const daily = await request(app).get("/api/dataset/astronauts/SIM-001/daily").set(user.auth).expect(200);
    expect(daily.body.days).toHaveLength(1);
    expect(daily.body.illnessEpisodes).toHaveLength(1);
    expect(daily.body.events.length).toBeGreaterThan(0);

    await request(app).get("/api/dataset/astronauts/NOSUCH/observations").set(user.auth).expect(404);
  });

  it("NEVER mixes simulated rows into a real user's endpoints", async () => {
    const user = await newUser();
    const list = await request(app).get("/api/vitals/observations").set(user.auth).expect(200);
    expect(list.body.hasData).toBe(false);
    const latest = await request(app).get("/api/vitals/observations/latest").set(user.auth).expect(200);
    expect(latest.body.hasData).toBe(false);
    const trends = await request(app).get("/api/analytics/trends").set(user.auth).expect(200);
    expect(trends.body.series).toHaveLength(0);
    const ov = await request(app).get("/api/analytics/overview").set(user.auth).expect(200);
    expect(ov.body.realReadings).toBe(0);
    const sleep = await request(app).get("/api/summaries/sleep").set(user.auth).expect(200);
    expect(sleep.body.hasData).toBe(false);
  });

  it("user isolation across accounts holds for synced profile data too", async () => {
    const a = await newUser();
    const b = await newUser();
    await request(app).post("/api/onboarding/sync").set(a.auth).send({ basic: { age: "40" } }).expect(200);
    const snap = await request(app).get("/api/onboarding/snapshot").set(b.auth).expect(200);
    expect(snap.body.hasData).toBe(false);
  });
});
