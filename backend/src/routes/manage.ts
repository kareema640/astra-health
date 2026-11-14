import { Router } from "express";
import { query, queryOne } from "../db";
import { h, notFound, validationFail } from "../lib/api";
import { requireAuth, resolveAstronaut } from "../middleware/auth";
import {
  plannerMissionPatchSchema,
  plannerMissionSchema,
  workoutPatchSchema,
  workoutSchema,
} from "../validators/manage";

/**
 * Per-user, server-persisted management for the Mission Planner and the
 * Activity & Exercise log. Every query is scoped to the authenticated
 * astronaut's own rows; PATCH/DELETE of another user's id is indistinguish-
 * able from "not found". No localStorage, no hardcoded records — new
 * accounts start honest and empty.
 */
export const plannerRouter = Router();
export const workoutRouter = Router();

plannerRouter.use(requireAuth());
workoutRouter.use(requireAuth());

/**
 * Restored originals (git 1c74181) of the default Mission Planner tasks and
 * countermeasure sessions the site shipped with. Seeded server-side exactly
 * once per astronaut — the claim flag makes deletion final, and users who
 * already own rows never receive duplicates. Stored like any other record,
 * so add/edit/delete stay entirely the user's.
 */
const STARTER_MISSIONS = [
  { title: "Morning SpO₂ & Resting HR Check", timeUtc: "06:30 UTC", category: "Vital Check", status: "done" },
  { title: "Vitamin D3 & Iron Supplementation", timeUtc: "07:15 UTC", category: "Nutrition", status: "done" },
  { title: "ARED Strength Training Block", timeUtc: "10:00 UTC", category: "Exercise", status: "pending" },
  { title: "EVA Suit Seal & Comms Check", timeUtc: "14:00 UTC", category: "EVA Prep", status: "pending" },
  { title: "Evening Core Body Temp Log", timeUtc: "19:00 UTC", category: "Vital Check", status: "pending" },
  { title: "Pre-Sleep Recovery & Hydration Wind-Down", timeUtc: "21:30 UTC", category: "Rest", status: "pending" },
] as const;

/** Original order preserved: seeded newest-needed-last so created_at DESC shows ARED first. */
const STARTER_SESSIONS = [
  { name: "Microgravity Core Stabilization", durationMin: 20, focus: "Core", completed: false, notes: "Postural Stability" },
  { name: "CEVIS Ergometer Cycle", durationMin: 25, focus: "Cardio", completed: false, notes: "Endurance" },
  { name: "T2 Treadmill Interval Run", durationMin: 30, focus: "Cardio", completed: true, notes: "Cardio / Aerobic" },
  { name: "ARED Squats & Deadlifts", durationMin: 40, focus: "Resistance", completed: true, notes: "Lower Body / Bone" },
] as const;

export async function ensureStarterData(aid: string): Promise<void> {
  // Atomic claim: exactly one request per astronaut ever proceeds past this.
  const claimed = await query<{ id: string }>(
    `UPDATE astronauts SET starter_data_seeded = true
     WHERE id = $1 AND starter_data_seeded = false RETURNING id`,
    [aid],
  );
  if (claimed.length === 0) return;
  const [hasMissions] = await query<{ one: number }>(
    "SELECT 1 AS one FROM planner_missions WHERE astronaut_id = $1 LIMIT 1",
    [aid],
  );
  if (!hasMissions) {
    for (const m of STARTER_MISSIONS) {
      await query(
        `INSERT INTO planner_missions
           (astronaut_id, title, category, time_utc, status)
         VALUES ($1,$2,$3,$4,$5)`,
        [aid, m.title, m.category, m.timeUtc, m.status],
      );
    }
  }
  const [hasSessions] = await query<{ one: number }>(
    "SELECT 1 AS one FROM workout_sessions WHERE astronaut_id = $1 LIMIT 1",
    [aid],
  );
  if (!hasSessions) {
    for (const s of STARTER_SESSIONS) {
      await query(
        `INSERT INTO workout_sessions
           (astronaut_id, name, focus, duration_min, notes, completed)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [aid, s.name, s.focus, s.durationMin, s.notes, s.completed],
      );
    }
  }
}

const MISSION_COLS = `
  id, title, description, category, time_utc AS "timeUtc",
  scheduled_day::text AS "scheduledDay", duration_min AS "durationMin",
  priority, status, (status = 'done') AS done,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

const SESSION_COLS = `
  id, name, focus, duration_min AS "durationMin",
  session_day::text AS "sessionDay", notes, completed,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

plannerRouter.get(
  "/missions",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    await ensureStarterData(aid);
    const items = await query<Record<string, unknown>>(
      `SELECT ${MISSION_COLS} FROM planner_missions
       WHERE astronaut_id = $1
       ORDER BY COALESCE(scheduled_day, DATE '9999-12-31'), time_utc, created_at`,
      [aid],
    );
    res.json({ missions: items });
  }),
);

plannerRouter.post(
  "/missions",
  h(async (req, res) => {
    const parsed = plannerMissionSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);
    const aid = await resolveAstronaut(req.user);
    const d = parsed.data;
    const [row] = await query<Record<string, unknown>>(
      `INSERT INTO planner_missions
         (astronaut_id, title, description, category, time_utc, scheduled_day,
          duration_min, priority, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING ${MISSION_COLS}`,
      [
        aid,
        d.title,
        d.description ?? null,
        d.category,
        d.timeUtc,
        d.scheduledDay ?? null,
        d.durationMin ?? null,
        d.priority,
        d.status,
      ],
    );
    res.status(201).json({ mission: row });
  }),
);

plannerRouter.patch(
  "/missions/:id",
  h(async (req, res) => {
    const parsed = plannerMissionPatchSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);
    const aid = await resolveAstronaut(req.user);
    const d = parsed.data;
    const [row] = await query<Record<string, unknown>>(
      `UPDATE planner_missions SET
         title = COALESCE($3, title),
         description = COALESCE($4, description),
         category = COALESCE($5, category),
         time_utc = COALESCE($6, time_utc),
         scheduled_day = COALESCE($7, scheduled_day),
         duration_min = COALESCE($8, duration_min),
         priority = COALESCE($9, priority),
         status = COALESCE($10, status),
         updated_at = now()
       WHERE id = $1 AND astronaut_id = $2
       RETURNING ${MISSION_COLS}`,
      [
        req.params.id,
        aid,
        d.title ?? null,
        d.description ?? null,
        d.category ?? null,
        d.timeUtc ?? null,
        d.scheduledDay ?? null,
        d.durationMin ?? null,
        d.priority ?? null,
        d.status ?? null,
      ],
    );
    if (!row) return notFound(res, "mission");
    res.json({ mission: row });
  }),
);

plannerRouter.delete(
  "/missions/:id",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const [row] = await query<{ id: string }>(
      "DELETE FROM planner_missions WHERE id = $1 AND astronaut_id = $2 RETURNING id",
      [req.params.id, aid],
    );
    if (!row) return notFound(res, "mission");
    res.json({ deleted: true });
  }),
);

workoutRouter.get(
  "/sessions",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    await ensureStarterData(aid);
    const items = await query<Record<string, unknown>>(
      `SELECT ${SESSION_COLS} FROM workout_sessions
       WHERE astronaut_id = $1
       ORDER BY COALESCE(session_day, DATE '0001-01-01') DESC, created_at DESC`,
      [aid],
    );
    res.json({ sessions: items });
  }),
);

workoutRouter.post(
  "/sessions",
  h(async (req, res) => {
    const parsed = workoutSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);
    const aid = await resolveAstronaut(req.user);
    const d = parsed.data;
    const [row] = await query<Record<string, unknown>>(
      `INSERT INTO workout_sessions
         (astronaut_id, name, focus, duration_min, session_day, notes, completed)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING ${SESSION_COLS}`,
      [aid, d.name, d.focus, d.durationMin, d.sessionDay ?? null, d.notes ?? null, d.completed],
    );
    res.status(201).json({ session: row });
  }),
);

workoutRouter.patch(
  "/sessions/:id",
  h(async (req, res) => {
    const parsed = workoutPatchSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);
    const aid = await resolveAstronaut(req.user);
    const d = parsed.data;
    const [row] = await query<Record<string, unknown>>(
      `UPDATE workout_sessions SET
         name = COALESCE($3, name),
         focus = COALESCE($4, focus),
         duration_min = COALESCE($5, duration_min),
         session_day = COALESCE($6, session_day),
         notes = COALESCE($7, notes),
         completed = COALESCE($8, completed),
         updated_at = now()
       WHERE id = $1 AND astronaut_id = $2
       RETURNING ${SESSION_COLS}`,
      [
        req.params.id,
        aid,
        d.name ?? null,
        d.focus ?? null,
        d.durationMin ?? null,
        d.sessionDay ?? null,
        d.notes ?? null,
        d.completed ?? null,
      ],
    );
    if (!row) return notFound(res, "session");
    res.json({ session: row });
  }),
);

workoutRouter.delete(
  "/sessions/:id",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const [row] = await query<{ id: string }>(
      "DELETE FROM workout_sessions WHERE id = $1 AND astronaut_id = $2 RETURNING id",
      [req.params.id, aid],
    );
    if (!row) return notFound(res, "session");
    res.json({ deleted: true });
  }),
);
