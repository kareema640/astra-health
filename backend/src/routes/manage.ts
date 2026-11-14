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
