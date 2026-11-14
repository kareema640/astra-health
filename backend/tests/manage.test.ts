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
    expect(list.body.missions).toHaveLength(1);

    const patched = await request(app)
      .patch(`/api/planner/missions/${m.id}`)
      .set(u.auth)
      .send({ status: "done" })
      .expect(200);
    expect((patched.body.mission as MissionRow).done).toBe(true);

    await request(app).delete(`/api/planner/missions/${m.id}`).set(u.auth).expect(200);
    const after = await request(app).get("/api/planner/missions").set(u.auth);
    expect(after.body.missions).toHaveLength(0);
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
    expect(bobList.body.missions).toHaveLength(0);
    await request(app).patch(`/api/planner/missions/${id}`).set(bob.auth).send({ status: "done" }).expect(404);
    await request(app).delete(`/api/planner/missions/${id}`).set(bob.auth).expect(404);

    // Still intact for Alice.
    const aliceList = await request(app).get("/api/planner/missions").set(alice.auth);
    expect(aliceList.body.missions).toHaveLength(1);
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
    expect(after.body.sessions).toHaveLength(0);
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
    const res = await request(app)
      .post("/api/workouts/sessions")
      .set(alice.auth)
      .send({ name: "ARED Squats", focus: "Resistance", durationMin: 40 })
      .expect(201);
    const id = (res.body.session as SessionRow).id;
    const bobList = await request(app).get("/api/workouts/sessions").set(bob.auth);
    expect(bobList.body.sessions).toHaveLength(0);
    await request(app).delete(`/api/workouts/sessions/${id}`).set(bob.auth).expect(404);
  });
});
