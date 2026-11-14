import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, newUser, setupDb, teardownDb, wipe } from "./helpers";

beforeAll(setupDb);
afterAll(teardownDb);

interface MissionRow {
  id: string;
  title: string;
  category: string;
  timeUtc: string;
  priority: string;
  status: string;
  done: boolean;
  durationMin: number | null;
}
interface SessionRow {
  id: string;
  name: string;
  focus: string;
  durationMin: number;
  completed: boolean;
  notes: string | null;
  sessionDay: string | null;
}

describe("Mission Planner CRUD", () => {
  it("requires auth", async () => {
    await request(app).get("/api/planner/missions").expect(401);
  });

  it("creates, lists, updates status and deletes user-owned missions", async () => {
    await wipe();
    const u = await newUser();
    // First visit claims the restored starter set, like the real UI does.
    const seeded = await request(app).get("/api/planner/missions").set(u.auth).expect(200);
    expect(seeded.body.missions).toHaveLength(6);
    const created = await request(app)
      .post("/api/planner/missions")
      .set(u.auth)
      .send({ title: "Cabin O₂ Calibration", category: "EVA Prep", priority: "high", durationMin: 45 })
      .expect(201);
    const m = created.body.mission as MissionRow;
    expect(m.title).toBe("Cabin O₂ Calibration");
    expect(m.category).toBe("EVA Prep");
    expect(m.priority).toBe("high");
    expect(m.status).toBe("pending");
    expect(m.done).toBe(false);
    expect(m.timeUtc).toBe("12:00 UTC"); // default when omitted

    const list = await request(app)
      .get("/api/planner/missions")
      .set(u.auth)
      .expect(200);
    // 6 restored starter tasks + the created one.
    expect(list.body.missions).toHaveLength(7);

    const patched = await request(app)
      .patch(`/api/planner/missions/${m.id}`)
      .set(u.auth)
      .send({ status: "done" })
      .expect(200);
    expect((patched.body.mission as MissionRow).done).toBe(true);

    await request(app).delete(`/api/planner/missions/${m.id}`).set(u.auth).expect(200);
    const after = await request(app).get("/api/planner/missions").set(u.auth);
    expect(after.body.missions).toHaveLength(6);
    expect(JSON.stringify(after.body.missions)).not.toContain("Cabin O₂");
  });

  it("rejects empty titles and unknown categories", async () => {
    const u = await newUser();
    await request(app)
      .post("/api/planner/missions")
      .set(u.auth)
      .send({ title: "  " })
      .expect(400);
    const bad = await request(app)
      .post("/api/planner/missions")
      .set(u.auth)
      .send({ title: "X", category: "Karaoke" })
      .expect(400);
    expect(bad.body.error.fields.category).toBeTruthy();
  });

  it("isolates users: other users cannot list, edit or delete", async () => {
    const alice = await newUser();
    const bob = await newUser();
    const res = await request(app)
      .post("/api/planner/missions")
      .set(alice.auth)
      .send({ title: "Alice's EVA timeline" })
      .expect(201);
    const id = (res.body.mission as MissionRow).id;

    const bobList = await request(app).get("/api/planner/missions").set(bob.auth).expect(200);
    expect(JSON.stringify(bobList.body.missions)).not.toContain("Alice");
    await request(app).patch(`/api/planner/missions/${id}`).set(bob.auth).send({ status: "done" }).expect(404);
    await request(app).delete(`/api/planner/missions/${id}`).set(bob.auth).expect(404);

    // Still intact for Alice (plus her starter set, shared titles excluded).
    const aliceList = await request(app).get("/api/planner/missions").set(alice.auth);
    expect(aliceList.body.missions.filter((m: { title: string }) => m.title === "Alice's EVA timeline")).toHaveLength(1);
  });
});

describe("Activity & Exercise sessions CRUD", () => {
  it("creates with defaults, toggles completion, edits fields, deletes", async () => {
    await wipe();
    const u = await newUser();
    const created = await request(app)
      .post("/api/workouts/sessions")
      .set(u.auth)
      .send({ name: "T2 Treadmill Interval Run", focus: "Cardio", durationMin: 30, notes: "RPE 6/10" })
      .expect(201);
    const s = created.body.session as SessionRow;
    expect(s.focus).toBe("Cardio");
    expect(s.completed).toBe(false);
    expect(s.notes).toBe("RPE 6/10");

    const toggled = await request(app)
      .patch(`/api/workouts/sessions/${s.id}`)
      .set(u.auth)
      .send({ completed: true })
      .expect(200);
    expect((toggled.body.session as SessionRow).completed).toBe(true);

    const edited = await request(app)
      .patch(`/api/workouts/sessions/${s.id}`)
      .set(u.auth)
      .send({ durationMin: 35, name: "T2 Treadmill Intervals" })
      .expect(200);
    const e = edited.body.session as SessionRow;
    expect(e.durationMin).toBe(35);
    expect(e.name).toBe("T2 Treadmill Intervals");
    expect(e.completed).toBe(true); // untouched fields preserved

    await request(app).delete(`/api/workouts/sessions/${s.id}`).set(u.auth).expect(200);
    const after = await request(app).get("/api/workouts/sessions").set(u.auth);
    expect(after.body.sessions).toHaveLength(4); // restored starters, no re-add
    expect(JSON.stringify(after.body.sessions)).not.toContain("T2 Treadmill Intervals");
  });

  it("validates duration and rejects empty updates", async () => {
    const u = await newUser();
    await request(app)
      .post("/api/workouts/sessions")
      .set(u.auth)
      .send({ name: "Sprint", focus: "Cardio", durationMin: 0 })
      .expect(400);
    const badDay = await request(app)
      .post("/api/workouts/sessions")
      .set(u.auth)
      .send({ name: "Sprint", durationMin: 10, sessionDay: "not-a-date" })
      .expect(400);
    expect(badDay.body.error.fields.sessionDay).toBeTruthy();

    const made = await request(app)
      .post("/api/workouts/sessions")
      .set(u.auth)
      .send({ name: "Sprint", durationMin: 10 })
      .expect(201);
    await request(app)
      .patch(`/api/workouts/sessions/${(made.body.session as SessionRow).id}`)
      .set(u.auth)
      .send({})
      .expect(400);
  });

  it("isolates sessions between users", async () => {
    const alice = await newUser();
    const bob = await newUser();
    await request(app).get("/api/workouts/sessions").set(bob.auth); // bob claims seed
    const res = await request(app)
      .post("/api/workouts/sessions")
      .set(alice.auth)
      .send({ name: "Alice rowing piece", focus: "Cardio", durationMin: 40 })
      .expect(201);
    const id = (res.body.session as SessionRow).id;
    const bobList = await request(app).get("/api/workouts/sessions").set(bob.auth);
    expect(JSON.stringify(bobList.body.sessions)).not.toContain("Alice rowing piece");
    await request(app).delete(`/api/workouts/sessions/${id}`).set(bob.auth).expect(404);
  });
});

describe("Restored starter data (original defaults, seeded once)", () => {
  it("gives a first-time account the exact original tasks and sessions", async () => {
    await wipe();
    const u = await newUser();
    const missions = (await request(app).get("/api/planner/missions").set(u.auth).expect(200)).body
      .missions as MissionRow[];
    expect(missions.map((m) => m.title)).toEqual([
      "Morning SpO₂ & Resting HR Check",
      "Vitamin D3 & Iron Supplementation",
      "ARED Strength Training Block",
      "EVA Suit Seal & Comms Check",
      "Evening Core Body Temp Log",
      "Pre-Sleep Recovery & Hydration Wind-Down",
    ]);
    expect(missions[0]?.status).toBe("done");
    expect(missions[1]?.status).toBe("done");
    expect(missions[2]?.status).toBe("pending");

    const sessions = (await request(app).get("/api/workouts/sessions").set(u.auth).expect(200)).body
      .sessions as SessionRow[];
    expect(sessions.map((x) => x.name)).toEqual([
      "ARED Squats & Deadlifts",
      "T2 Treadmill Interval Run",
      "CEVIS Ergometer Cycle",
      "Microgravity Core Stabilization",
    ]);
    expect(sessions[0]?.completed).toBe(true);
    expect(sessions[2]?.completed).toBe(false);
  });

  it("never re-seeds after deletion and never duplicates for existing rows", async () => {
    const u = await newUser();
    const first = (await request(app).get("/api/planner/missions").set(u.auth)).body
      .missions as MissionRow[];
    for (const m of first) {
      await request(app).delete(`/api/planner/missions/${m.id}`).set(u.auth).expect(200);
    }
    const after = (await request(app).get("/api/planner/missions").set(u.auth)).body
      .missions as MissionRow[];
    expect(after).toHaveLength(0);

    // A user who owned rows before their first GET keeps exactly those.
    const v = await newUser();
    await request(app)
      .post("/api/planner/missions")
      .set(v.auth)
      .send({ title: "Pre-existing custom plan" })
      .expect(201);
    const vList = (await request(app).get("/api/planner/missions").set(v.auth)).body
      .missions as MissionRow[];
    expect(vList.map((m) => m.title)).toEqual(["Pre-existing custom plan"]);
  });
});
