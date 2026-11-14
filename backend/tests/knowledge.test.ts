import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import {
  MEDICAL_STANDARDS,
  MISSION_STANDARDS,
  guidelineSummaryForPrompt,
} from "../src/knowledge/standards";
import { buildHealthContext } from "../src/assistant/context";
import { verifyAccessToken } from "../src/tokens";
import { queryOne } from "../src/db";
import { app, newUser, setupDb, syncUser, teardownDb, wipe } from "./helpers";

beforeAll(setupDb);
afterAll(teardownDb);

describe("GET /api/knowledge — cited standards registry", () => {
  it("serves the full registry without authentication (public reference data)", async () => {
    const res = await request(app).get("/api/knowledge/standards").expect(200);
    expect(res.body.disclaimer).toContain("not personal medical advice");
    expect(res.body.metrics.heart_rate.normalAdult).toBe("60–100");
    expect(res.body.metrics.heart_rate.sources.length).toBeGreaterThanOrEqual(2);
    expect(res.body.mission.radiation_career_limit.value).toContain("600 mSv");
    expect(res.headers["cache-control"]).toContain("max-age");
  });

  it("every metric and mission entry carries at least one https source", () => {
    const all = [...Object.values(MEDICAL_STANDARDS), ...Object.values(MISSION_STANDARDS)];
    expect(all.length).toBeGreaterThanOrEqual(14);
    for (const entry of all) {
      const sources =
        "sources" in entry ? entry.sources : [entry as { title: string; url: string }];
      expect(sources.length).toBeGreaterThan(0);
      for (const s of sources) {
        expect(s.url).toMatch(/^https:\/\//);
        expect(s.title.length).toBeGreaterThan(5);
      }
    }
  });

  it("NASA spaceflight standards are cited where they exist", () => {
    expect(MEDICAL_STANDARDS.bone_density.spaceflight).toContain("95%");
    expect(MEDICAL_STANDARDS.bone_density.alertBelow).toContain("1–1.5%");
    expect(MEDICAL_STANDARDS.sleep_hours.spaceflight).toContain("8.5");
    expect(MEDICAL_STANDARDS.activity_fitness.spaceflight).toContain("32.9");
    expect(MEDICAL_STANDARDS.blood_pressure.spaceflight).toContain("4–17%");
  });

  it("looks up one metric and 404s on unknown keys", async () => {
    const ok = await request(app).get("/api/knowledge/standards/spo2").expect(200);
    expect(ok.body.unit).toBe("%");
    await request(app).get("/api/knowledge/standards/magic_beans").expect(404);
  });

  it("compact prompt summary names sources per line", () => {
    const summary = guidelineSummaryForPrompt();
    expect(Object.keys(summary).length).toBeGreaterThanOrEqual(10);
    expect(summary.heart_rate).toContain("60–100");
    expect(summary.heart_rate).toContain("[sources: ");
  });
});

describe("Assistant real-data context includes cited references", () => {
  it("injects standards only for metrics the user actually has", async () => {
    await wipe();
    const user = await newUser();
    await syncUser(user, {
      basic: { age: "34", sex: "female" },
      progress: { basic: "done" },
    });
    await request(app)
      .post("/api/vitals/observations")
      .set(user.auth)
      .send({ heartRate: "88", spo2: "97" })
      .expect(201);

    // Same resolution the API uses: token sub -> astronauts row.
    const claims = verifyAccessToken(user.accessToken)!;
    const row = await queryOne<{ id: string }>("SELECT id FROM astronauts WHERE user_id = $1", [
      claims.sub,
    ]);
    const ctx = await buildHealthContext(row!.id, user.astronautId);
    expect(ctx.reference_standards.heart_rate).toContain("60–100");
    expect(ctx.reference_standards.spo2).toBeDefined();
    // No blood-pressure reading recorded → its standard is not injected.
    expect(ctx.reference_standards.blood_pressure).toBeUndefined();
    // Never collected → never claimed.
    expect(ctx.reference_standards.blood_glucose).toBeUndefined();
    // The measured values stay in their own fields; standards are framing.
    expect(ctx.heart_rate).toBe(88);
  });
});
