import { Router } from "express";
import { query, queryOne } from "../db";
import { h, validationFail } from "../lib/api";
import { requireAuth, resolveAstronaut } from "../middleware/auth";
import { alertsSchema } from "../validators/health";

/**
 * Heart & Recovery: the user's answers, their alert rule, recent REAL
 * readings, and stored rule-engine evaluations. No invented baselines: if no
 * manual readings exist, the readings list is simply empty.
 */
export const heartRouter = Router();
heartRouter.use(requireAuth());

heartRouter.get(
  "/recovery",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const profile = await queryOne(
      `SELECT resting_hr AS "restingHr", conditions, alert_enabled AS "alertEnabled",
              sleep_target AS "sleepTarget", hydration
       FROM onboarding_heart_recovery WHERE astronaut_id = $1`,
      [aid],
    );
    const rule = await queryOne(
      `SELECT hr_above AS "hrAbove", hr_below AS "hrBelow", spo2_below AS "spo2Below",
              temp_above_c AS "tempAbove", enabled
       FROM alert_rules WHERE astronaut_id = $1`,
      [aid],
    );
    const recent = await query(
      `SELECT ts AS "measuredAt", heart_rate_bpm AS "heartRate", hrv_rmssd_ms AS "hrvRmssd"
       FROM vital_observations
       WHERE astronaut_id = $1 AND source IN ('manual','sensor') AND is_synthetic = false
         AND heart_rate_bpm IS NOT NULL
       ORDER BY ts DESC LIMIT 24`,
      [aid],
    );
    const evaluations = await query(
      `SELECT evaluated_at AS "at", metric, observed_value AS "value", threshold,
              direction, triggered
       FROM alert_evaluations WHERE astronaut_id = $1
       ORDER BY evaluated_at DESC LIMIT 20`,
      [aid],
    );
    return res.json({
      profile: profile ?? null,
      alerts: rule ?? null,
      heartRateReadings: recent,
      hasData: Boolean(profile) || recent.length > 0,
      evaluations,
    });
  }),
);

heartRouter.put(
  "/alerts",
  h(async (req, res) => {
    const parsed = alertsSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);
    const aid = await resolveAstronaut(req.user);
    const d = parsed.data;
    await query(
      `INSERT INTO alert_rules (astronaut_id, enabled, hr_above, hr_below, spo2_below, temp_above_c)
       VALUES ($1,COALESCE($2,true),$3,$4,$5,$6)
       ON CONFLICT (astronaut_id) DO UPDATE SET
         enabled = COALESCE($2, alert_rules.enabled),
         hr_above = COALESCE($3, alert_rules.hr_above),
         hr_below = COALESCE($4, alert_rules.hr_below),
         spo2_below = COALESCE($5, alert_rules.spo2_below),
         temp_above_c = COALESCE($6, alert_rules.temp_above_c),
         updated_at = now()`,
      [aid, d.enabled, d.hrAbove, d.hrBelow, d.spo2Below, d.tempAbove],
    );
    const rule = await queryOne(
      `SELECT hr_above AS "hrAbove", hr_below AS "hrBelow", spo2_below AS "spo2Below",
              temp_above_c AS "tempAbove", enabled
       FROM alert_rules WHERE astronaut_id = $1`,
      [aid],
    );
    return res.json({ alerts: rule });
  }),
);
