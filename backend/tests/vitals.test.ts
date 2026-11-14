import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, newUser, setupDb, syncUser, teardownDb, wipe } from "./helpers";

beforeAll(async () => {
  await setupDb();
  await wipe(); // suites share one database; start clean
});
afterEach(wipe);
afterAll(teardownDb);

describe("POST /api/vitals/observations (manual entry only)", () => {
  it("stores a real reading and returns it with its timestamp", async () => {
    const user = await newUser();
    const res = await request(app)
      .post("/api/vitals/observations")
      .set(user.auth)
      .send({ heartRate: "72", spo2: "98", systolic: "118", diastolic: "76", temperatureC: "36.6" })
      .expect(201);
    expect(res.body.observation.heart_rate_bpm).toBe("72.0"); // numeric(5,1) scaled form
    expect(res.body.observation.systolic_bp_mmhg).toBe(118); // smallint → number
    const latest = await request(app).get("/api/vitals/observations/latest").set(user.auth).expect(200);
    expect(latest.body.hasData).toBe(true);
    expect(latest.body.latest.heartRate).toBe("72.0");
  });

  it("empty latest state reports hasData=false with null — never zeros", async () => {
    const user = await newUser();
    const res = await request(app).get("/api/vitals/observations/latest").set(user.auth).expect(200);
    expect(res.body).toMatchObject({ hasData: false, latest: null });
  });

  it("rejects empty submissions and physiologically impossible values", async () => {
    const user = await newUser();
    await request(app).post("/api/vitals/observations").set(user.auth).send({}).expect(400);
    const bad = await request(app)
      .post("/api/vitals/observations")
      .set(user.auth)
      .send({ spo2: "150" })
      .expect(400);
    expect(bad.body.error.fields.spo2).toMatch(/between 50 and 100/);
    await request(app)
      .post("/api/vitals/observations")
      .set(user.auth)
      .send({ systolic: "90", diastolic: "120" })
      .expect(400);
  });

  it("upserts by timestamp so the same reading entered twice stays one row", async () => {
    const user = await newUser();
    const at = new Date(Date.now() - 60_000).toISOString();
    await request(app).post("/api/vitals/observations").set(user.auth).send({ measuredAt: at, heartRate: 70 }).expect(201);
    await request(app).post("/api/vitals/observations").set(user.auth).send({ measuredAt: at, spo2: 97 }).expect(201);
    const list = await request(app).get("/api/vitals/observations").set(user.auth).expect(200);
    expect(list.body.count).toBe(1);
    expect(list.body.observations[0]).toMatchObject({ heartRate: "70.0", spo2: "97.0" });
  });

  it("evaluates the user's own alert thresholds against real values", async () => {
    const user = await newUser();
    await syncUser(user, { heart: { heartAlert: "on", alertAbove: "120", alertBelow: "45" } });
    const res = await request(app)
      .post("/api/vitals/observations")
      .set(user.auth)
      .send({ heartRate: 145 })
      .expect(201);
    expect(res.body.alerts).toHaveLength(1);
    expect(res.body.alerts[0]).toMatchObject({ metric: "heart_rate", triggered: true, threshold: "120" });
    const calm = await request(app)
      .post("/api/vitals/observations")
      .set(user.auth)
      .send({ heartRate: 80 })
      .expect(201);
    expect(calm.body.alerts).toHaveLength(0);
  });

  it("enforces user isolation: another account cannot see or fetch the row", async () => {
    const owner = await newUser();
    const intruder = await newUser();
    const created = await request(app)
      .post("/api/vitals/observations")
      .set(owner.auth)
      .send({ heartRate: 71 })
      .expect(201);
    const id = created.body.observation.id;
    const list = await request(app).get("/api/vitals/observations").set(intruder.auth).expect(200);
    expect(list.body.count).toBe(0);
    // 404 — other users' records are invisible, not merely forbidden.
    await request(app).get(`/api/vitals/observations/${id}`).set(intruder.auth).expect(404);
    await request(app).get(`/api/vitals/observations/${id}`).set(owner.auth).expect(200);
  });
});
