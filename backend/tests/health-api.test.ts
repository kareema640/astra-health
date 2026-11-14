import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, newUser, setupDb, teardownDb, wipe } from "./helpers";

beforeAll(async () => {
  await setupDb();
  await wipe(); // suites share one database; start clean
});
afterEach(wipe);
afterAll(teardownDb);

describe("daily summaries (sleep / muscle / neuro)", () => {
  it("upserts one row per day and lists only real entries", async () => {
    const user = await newUser();
    await request(app)
      .post("/api/summaries/sleep")
      .set(user.auth)
      .send({ day: "2026-11-10", totalDurationHr: "7.4", efficiencyPct: "88", awakenings: 2, qualityScore: 8 })
      .expect(201);
    await request(app)
      .post("/api/summaries/sleep")
      .set(user.auth)
      .send({ day: "2026-11-10", remHr: "1.6" })
      .expect(201);
    const list = await request(app).get("/api/summaries/sleep?from=2026-11-01&to=2026-11-30").set(user.auth).expect(200);
    expect(list.body.count).toBe(1);
    // Second partial update must not drop the first day's values.
    expect(list.body.days[0]).toMatchObject({
      totalDurationHr: "7.40",
      remHr: "1.60",
      awakenings: 2,
    });
  });

  it("merges partial updates without dropping earlier values", async () => {
    const user = await newUser();
    await request(app).post("/api/summaries/muscle").set(user.auth).send({ day: "2026-11-11", gripStrengthKg: "41.5" }).expect(201);
    await request(app).post("/api/summaries/muscle").set(user.auth).send({ day: "2026-11-11", soreness: 3 }).expect(201);
    const list = await request(app).get("/api/summaries/muscle?from=2026-11-01&to=2026-11-30").set(user.auth).expect(200);
    expect(list.body.days[0].gripStrengthKg).toBe("41.5");
    expect(list.body.days[0].soreness).toBe("3.0");
  });

  it("validates day and ranges", async () => {
    const user = await newUser();
    await request(app).post("/api/summaries/neuro").set(user.auth).send({ mood: 5 }).expect(400);
    await request(app).post("/api/summaries/neuro").set(user.auth).send({ day: "2026-11-11", mood: "12" }).expect(400);
  });

  it("keeps other users' summaries invisible", async () => {
    const a = await newUser();
    const b = await newUser();
    await request(app).post("/api/summaries/sleep").set(a.auth).send({ day: "2026-11-12", qualityScore: 7 }).expect(201);
    const list = await request(app).get("/api/summaries/sleep").set(b.auth).expect(200);
    expect(list.body.hasData).toBe(false);
  });
});

describe("analytics + AI honesty layer", () => {
  it("trends are empty until real readings exist, then computed from them", async () => {
    const user = await newUser();
    const empty = await request(app).get("/api/analytics/trends?metric=heartRate").set(user.auth).expect(200);
    expect(empty.body.hasData).toBe(false);
    expect(empty.body.series).toHaveLength(0);
    expect(empty.body.message).toMatch(/No real measurements/);

    await request(app).post("/api/vitals/observations").set(user.auth).send({ heartRate: 70 }).expect(201);
    await request(app).post("/api/vitals/observations").set(user.auth).send({ heartRate: 90 }).expect(201);
    const filled = await request(app).get("/api/analytics/trends?metric=heartRate").set(user.auth).expect(200);
    expect(filled.body.hasData).toBe(true);
    expect(filled.body.series.at(-1).avg).toBe("80.0"); // computed average of two real rows
    expect(filled.body.series.at(-1).samples).toBe(2);
    expect(filled.body.generated).toBe(false);
  });

  it("rejects unknown metrics with guidance", async () => {
    const user = await newUser();
    const res = await request(app).get("/api/analytics/trends?metric=mood").set(user.auth).expect(400);
    expect(res.body.error.fields.metric).toMatch(/Supported metrics/);
  });

  it("AI analysis is explicitly not connected (503) and lists stay honest", async () => {
    const user = await newUser();
    const run = await request(app).post("/api/ai/analyses/run").set(user.auth);
    expect(run.status).toBe(503);
    expect(run.body.error.code).toBe("AI_NOT_CONNECTED");

    const analyses = await request(app).get("/api/ai/analyses").set(user.auth).expect(200);
    expect(analyses.body.engineConnected).toBe(false);
    expect(analyses.body.hasData).toBe(false);

    const recs = await request(app).get("/api/ai/recommendations").set(user.auth).expect(200);
    expect(recs.body.hasData).toBe(false);
  });

  it("overview reflects real counts only", async () => {
    const user = await newUser();
    const ov = await request(app).get("/api/analytics/overview").set(user.auth).expect(200);
    expect(ov.body).toMatchObject({ realReadings: 0, hasData: false });
  });
});

describe("documents + missions", () => {
  it("links report filenames as metadata-only references", async () => {
    const user = await newUser();
    const res = await request(app)
      .post("/api/documents")
      .set(user.auth)
      .send({ kind: "dexa_report", filename: "scan.pdf", mime: "application/pdf", bytes: 12000 })
      .expect(201);
    expect(res.body.status).toBe("metadata_only");
    const list = await request(app).get("/api/documents").set(user.auth).expect(200);
    expect(list.body.documents[0].filename).toBe("scan.pdf");
  });

  it("missions endpoint requires auth and serves registry data", async () => {
    await request(app).get("/api/missions").expect(401);
    const user = await newUser();
    const res = await request(app).get("/api/missions").set(user.auth).expect(200);
    expect(Array.isArray(res.body.missions)).toBe(true);
  });
});
