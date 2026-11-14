import { Router } from "express";
import { query, queryOne } from "../db";
import { h, notFound, validationFail } from "../lib/api";
import { requireAuth, resolveAstronaut } from "../middleware/auth";
import { observationSchema, rangeSchema } from "../validators/health";

/**
 * Real, user-entered vital measurements. Nothing is generated: a reading
 * exists only if the user (or a future sensor feed) recorded it. When a saved
 * reading crosses the user's own alert thresholds, the rule engine evaluates
 * it against the actual value — a computed metric, flagged as such.
 */
export const vitalsRouter = Router();
vitalsRouter.use(requireAuth());

vitalsRouter.post(
  "/observations",
  h(async (req, res) => {
    const parsed = observationSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);
    const d = parsed.data;
    const provided = ["heartRate", "hrvRmssd", "systolic", "diastolic", "spo2", "respiratoryRate", "temperatureC"] as const;
    if (!provided.some((k) => d[k] !== null && d[k] !== undefined)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION",
          message: "Record at least one measurement",
          fields: { _: "Enter at least one value to save a reading" },
        },
      });
    }
    const aid = await resolveAstronaut(req.user);
    const ts = d.measuredAt ? new Date(d.measuredAt).toISOString() : new Date().toISOString();
    if (new Date(ts).getTime() > Date.now() + 5 * 60_000) {
      return res.status(400).json({
        error: {
          code: "VALIDATION",
          message: "Measurements cannot be dated in the future",
          fields: { measuredAt: "Measurements cannot be dated in the future" },
        },
      });
    }
    const [row] = await query<Record<string, unknown>>(
      `INSERT INTO vital_observations
         (astronaut_id, ts, source, device_label, heart_rate_bpm, hrv_rmssd_ms,
          systolic_bp_mmhg, diastolic_bp_mmhg, spo2_pct, respiratory_rate_brmin,
          body_temperature_c)
       VALUES ($1,$2,'manual',$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (astronaut_id, ts, source) DO UPDATE SET
         device_label = EXCLUDED.device_label,
         heart_rate_bpm = COALESCE(EXCLUDED.heart_rate_bpm, vital_observations.heart_rate_bpm),
         hrv_rmssd_ms = COALESCE(EXCLUDED.hrv_rmssd_ms, vital_observations.hrv_rmssd_ms),
         systolic_bp_mmhg = COALESCE(EXCLUDED.systolic_bp_mmhg, vital_observations.systolic_bp_mmhg),
         diastolic_bp_mmhg = COALESCE(EXCLUDED.diastolic_bp_mmhg, vital_observations.diastolic_bp_mmhg),
         spo2_pct = COALESCE(EXCLUDED.spo2_pct, vital_observations.spo2_pct),
         respiratory_rate_brmin = COALESCE(EXCLUDED.respiratory_rate_brmin, vital_observations.respiratory_rate_brmin),
         body_temperature_c = COALESCE(EXCLUDED.body_temperature_c, vital_observations.body_temperature_c)
       RETURNING id, ts, heart_rate_bpm, systolic_bp_mmhg, diastolic_bp_mmhg,
                 spo2_pct, respiratory_rate_brmin, body_temperature_c`,
      [aid, ts, d.deviceLabel, d.heartRate, d.hrvRmssd, d.systolic, d.diastolic, d.spo2,
       d.respiratoryRate, d.temperatureC],
    );
    if (!row) {
      return res.status(500).json({ error: { code: "INTERNAL", message: "Could not save the reading" } });
    }

    // Rule engine: compare the REAL recorded values against the user's own
    // thresholds from onboarding. Evaluations are stored for history.
    const rule = await queryOne<Record<string, unknown>>(
      "SELECT hr_above, hr_below, spo2_below, temp_above_c, enabled FROM alert_rules WHERE astronaut_id = $1",
      [aid],
    );
    const alerts: unknown[] = [];
    if (rule && rule.enabled !== false) {
      const checks: [string, number | null | undefined, number | null, string][] = [
        ["heart_rate", d.heartRate, rule.hr_above === null ? null : Number(rule.hr_above), "above"],
        ["heart_rate", d.heartRate, rule.hr_below === null ? null : Number(rule.hr_below), "below"],
        ["spo2", d.spo2, rule.spo2_below === null ? null : Number(rule.spo2_below), "below"],
        ["body_temperature", d.temperatureC, rule.temp_above_c === null ? null : Number(rule.temp_above_c), "above"],
      ];
      for (const [metric, value, threshold, direction] of checks) {
        if (value === null || value === undefined || threshold === null) continue;
        const triggered = direction === "above" ? value > threshold : value < threshold;
        const [ev] = await query<Record<string, unknown>>(
          `INSERT INTO alert_evaluations
             (astronaut_id, observation_id, metric, observed_value, threshold, direction, triggered)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           RETURNING metric, observed_value, threshold, direction, triggered`,
          [aid, row.id, metric, value, threshold, direction, triggered],
        );
        if (triggered) alerts.push(ev);
      }
    }
    await query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, ip)
       VALUES ($1,'vitals.record','vital_observations',$2,$3)`,
      [req.user.id, row.id, req.ip ?? null],
    );
    return res.status(201).json({ observation: row, alerts });
  }),
);

vitalsRouter.get(
  "/observations/latest",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const row = await queryOne(
      `SELECT ts AS "measuredAt", heart_rate_bpm AS "heartRate", spo2_pct AS "spo2",
              respiratory_rate_brmin AS "respiratoryRate", body_temperature_c AS "temperatureC",
              systolic_bp_mmhg AS "systolic", diastolic_bp_mmhg AS "diastolic", source
       FROM vital_observations
       WHERE astronaut_id = $1 AND source IN ('manual','sensor')
       ORDER BY ts DESC LIMIT 1`,
      [aid],
    );
    // Honest empty state: no readings → null, not zeros.
    return res.json({ hasData: Boolean(row), latest: row ?? null });
  }),
);

vitalsRouter.get(
  "/observations",
  h(async (req, res) => {
    const parsed = rangeSchema.safeParse(req.query);
    if (!parsed.success) return validationFail(res, parsed.error);
    const aid = await resolveAstronaut(req.user);
    const { from, to, limit } = parsed.data;
    const where = ["astronaut_id = $1", "source IN ('manual','sensor')", "is_synthetic = false"];
    const params: unknown[] = [aid];
    if (from) { params.push(new Date(from).toISOString()); where.push(`ts >= $${params.length}`); }
    if (to) { params.push(new Date(to).toISOString()); where.push(`ts <= $${params.length}`); }
    params.push(limit);
    const rows = await query(
      `SELECT ts AS "measuredAt", heart_rate_bpm AS "heartRate", spo2_pct AS "spo2",
              respiratory_rate_brmin AS "respiratoryRate", body_temperature_c AS "temperatureC",
              systolic_bp_mmhg AS "systolic", diastolic_bp_mmhg AS "diastolic", source
       FROM vital_observations WHERE ${where.join(" AND ")}
       ORDER BY ts DESC LIMIT $${params.length}`,
      params,
    );
    return res.json({ count: rows.length, hasData: rows.length > 0, observations: rows });
  }),
);

vitalsRouter.get(
  "/observations/:id",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const row = await queryOne(
      `SELECT id, ts AS "measuredAt", heart_rate_bpm AS "heartRate", spo2_pct AS "spo2",
              respiratory_rate_brmin AS "respiratoryRate", body_temperature_c AS "temperatureC",
              systolic_bp_mmhg AS "systolic", diastolic_bp_mmhg AS "diastolic", source
       FROM vital_observations WHERE id = $1 AND astronaut_id = $2`,
      [req.params.id, aid],
    );
    // Other users' rows are invisible: 404, never 403-with-data.
    if (!row) return notFound(res, "Measurement");
    return res.json(row);
  }),
);
