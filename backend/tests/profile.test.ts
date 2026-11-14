import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { newUser, setupDb, syncUser, teardownDb, wipe, app } from "./helpers";

beforeAll(async () => {
  await setupDb();
  await wipe(); // suites share one database; start clean
});
afterEach(wipe);
afterAll(teardownDb);

describe("POST /api/onboarding/sync + GET /api/onboarding/snapshot", () => {
  it("persists a completed onboarding round-trip without altering the auth module", async () => {
    const user = await newUser();
    const snapshot = {
      account: { fullName: user.fullName, email: user.email, astronautId: user.astronautId, joinDate: "Nov 14, 2026" },
      basic: { age: "34", sex: "female", height: "175", heightUnit: "cm", weight: "63", weightUnit: "kg" },
      vitals: { systolic: "118", diastolic: "76", bpUnknown: false, respiratoryRate: "15", spo2: "98", measuredWithDevice: true },
      heart: { heartAlert: "on", restingHr: "58", conditions: ["none"], alertAbove: "120", alertBelow: "45", sleep: "7-8", hydration: "2-3" },
      muscle: { muscleMass: "45", boneDensity: "normal", emgFile: "emg_quads.pdf", dexaFile: "dexa_2026.pdf", emgGroup: "quadriceps" },
      avatar: { character: "commander", skin: "yellow", accent: "gold", callsign: "NOVA", fromPhoto: false, suit: "launch-orange", visor: "gold" },
      progress: { basic: "done", vitals: "done", heart: "done", muscle: "done", avatar: "done" },
    };
    expect((await syncUser(user, snapshot)).status).toBe(200);

    const res = await request(app).get("/api/onboarding/snapshot").set(user.auth).expect(200);
    expect(res.body.hasData).toBe(true);
    expect(res.body.snapshot.basic).toMatchObject({ age: "34", sex: "female", height: "175", heightUnit: "cm" });
    expect(res.body.snapshot.vitals).toMatchObject({ systolic: "118", diastolic: "76", spo2: "98", measuredWithDevice: true });
    expect(res.body.snapshot.heart).toMatchObject({ restingHr: "58", alertAbove: "120", conditions: ["none"] });
    expect(res.body.snapshot.muscle).toMatchObject({ boneDensity: "normal", emgFile: "emg_quads.pdf", dexaFile: "dexa_2026.pdf" });
    expect(res.body.snapshot.avatar).toMatchObject({ character: "commander", callsign: "NOVA", suit: "launch-orange", visor: "gold" });
    expect(res.body.snapshot.progress).toMatchObject({ basic: "done", avatar: "done" });
  });

  it("keeps unanswered fields null, never zero (missing ≠ 0 rule)", async () => {
    const user = await newUser();
    await syncUser(user, {
      basic: { age: "", sex: "male", height: "", weight: "" },
      vitals: { systolic: "", diastolic: "", bpUnknown: true, spo2: "" },
    }).then((r) => expect(r.status).toBe(200));
    const { client } = await import("./helpers");
    const prof = await client.query(
      `SELECT ap.age, ap.height, ap.weight FROM astronaut_profiles ap
       JOIN astronauts a ON a.id = ap.astronaut_id WHERE a.designator = $1`,
      [user.astronautId],
    );
    expect(prof.rows[0]).toMatchObject({ age: null, height: null, weight: null });
    const vit = await client.query(
      `SELECT v.systolic_mmhg, v.diastolic_mmhg, v.bp_unknown FROM onboarding_vitals_baselines v
       JOIN astronauts a ON a.id = v.astronaut_id WHERE a.designator = $1`,
      [user.astronautId],
    );
    expect(vit.rows[0]).toMatchObject({ systolic_mmhg: null, diastolic_mmhg: null, bp_unknown: true });
  });

  it("rejects out-of-range and unknown vocabulary values", async () => {
    const user = await newUser();
    const res = await syncUser(user, {
      basic: { age: "150" },
      heart: { conditions: ["telepathy"] },
      avatar: { character: "jedi" },
    });
    expect(res.status).toBe(400);
    expect(res.body.error.fields.basic_age ?? res.body.error.fields["basic.age"]).toBeTruthy();
  });

  it("requires authentication (401 without a token)", async () => {
    await request(app).post("/api/onboarding/sync").send({ basic: { age: "30" } }).expect(401);
    await request(app).get("/api/onboarding/snapshot").expect(401);
  });

  it("returns hasData=false for a fresh account (honest empty state)", async () => {
    const user = await newUser();
    const res = await request(app).get("/api/onboarding/snapshot").set(user.auth).expect(200);
    expect(res.body.hasData).toBe(false);
    expect(res.body.snapshot).toBeNull();
  });

  it("records an audit row without any health values", async () => {
    const user = await newUser();
    await syncUser(user, { basic: { age: "44", sex: "other" } });
    const { client } = await import("./helpers");
    const log = await client.query(
      "SELECT action, entity FROM audit_log WHERE action = 'onboarding.sync' ORDER BY created_at DESC LIMIT 1",
    );
    expect(log.rows[0]?.action).toBe("onboarding.sync");
    const raw = JSON.stringify(log.rows);
    expect(raw).not.toContain("44");
  });
});
