import { Router } from "express";
import { query, queryOne } from "../db";
import { h, notFound, validationFail } from "../lib/api";
import { requireAuth } from "../middleware/auth";
import { rangeSchema } from "../validators/health";

/**
 * The provided workbook is a SIMULATED spaceflight physiology dataset
 * (14,400 rows, 60 astronauts). It lives in the same schema but is strictly
 * separated from personal data: rows carry is_synthetic = true and their
 * astronauts.kind = 'simulated'. These endpoints serve the demo cohort for
 * AI-training/testing and never mix into a user's own /vitals, /sleep, etc.
 */
export const datasetRouter = Router();
datasetRouter.use(requireAuth());

const DISCLAIMER = "Simulated dataset for development and model training — not real medical data.";

datasetRouter.get("/meta", (_req, res) => {
  res.json({
    simulated: true,
    disclaimer: DISCLAIMER,
    note: "60 astronauts x 30 mission days x 8 readings per day; imported from astra_health_unified_dataset_480rows.csv",
  });
});

datasetRouter.get(
  "/astronauts",
  h(async (_req, res) => {
    const rows = await query(
      `SELECT a.designator AS "astronautId", a.display_name AS "displayName",
              count(v.id)::int AS "readings"
       FROM astronauts a
       LEFT JOIN vital_observations v ON v.astronaut_id = a.id AND v.is_synthetic
       WHERE a.kind = 'simulated'
       GROUP BY a.id ORDER BY a.designator LIMIT 100`,
    );
    res.json({ simulated: true, count: rows.length, astronauts: rows });
  }),
);

datasetRouter.get(
  "/astronauts/:designator/observations",
  h(async (req, res) => {
    const range = rangeSchema.safeParse({
      from: req.query["from"], to: req.query["to"], limit: req.query["limit"] ?? 500,
    });
    if (!range.success) return validationFail(res, range.error);
    const astro = await queryOne<{ id: string }>(
      "SELECT id FROM astronauts WHERE designator = $1 AND kind = 'simulated'",
      [req.params.designator],
    );
    if (!astro) return notFound(res, "Simulated astronaut");
    const params: unknown[] = [astro.id];
    const where = ["astronaut_id = $1", "is_synthetic = true"];
    if (range.data.from) { params.push(new Date(range.data.from).toISOString()); where.push(`ts >= $${params.length}`); }
    if (range.data.to) { params.push(new Date(range.data.to).toISOString()); where.push(`ts <= $${params.length}`); }
    params.push(Math.min(range.data.limit, 1000));
    const rows = await query(
      `SELECT ts AS "measuredAt", mission_day AS "missionDay", phase,
              heart_rate_bpm AS "heartRate", hrv_rmssd_ms AS "hrvRmssd",
              avg_heart_rate_bpm AS "avgHeartRate", max_heart_rate_bpm AS "maxHeartRate",
              min_heart_rate_bpm AS "minHeartRate",
              systolic_bp_mmhg AS "systolic", diastolic_bp_mmhg AS "diastolic",
              ecg_pr_interval_ms AS "ecgPrMs", ecg_qrs_duration_ms AS "ecgQrsMs",
              ecg_qt_interval_ms AS "ecgQtMs", ecg_qtc_interval_ms AS "ecgQtcMs",
              respiratory_rate_brmin AS "respiratoryRate", spo2_pct AS "spo2",
              respiratory_pattern AS "respiratoryPattern",
              respiratory_variability_rmssd_s AS "respVariabilityRmssdS",
              body_temperature_c AS "temperatureC", temperature_trend AS "temperatureTrend",
              activity_type AS "activityType", steps_movement_equivalent AS "stepsEquivalent",
              active_minutes AS "activeMinutes", activity_intensity AS "activityIntensity",
              co2_ppm AS "cabinCo2Ppm", cabin_temperature_c AS "cabinTempC",
              relative_humidity_pct AS "humidityPct", cabin_pressure_kpa AS "cabinPressureKpa",
              source_template AS "sourceTemplate"
       FROM v_dataset_samples WHERE astronaut_id = $1 AND ${where.join(" AND ")}
       ORDER BY ts ASC LIMIT $${params.length}`,
      params,
    );
    res.json({
      simulated: true,
      disclaimer: DISCLAIMER,
      astronautId: req.params.designator,
      count: rows.length,
      hasData: rows.length > 0,
      samples: rows,
    });
  }),
);

datasetRouter.get(
  "/astronauts/:designator/daily",
  h(async (req, res) => {
    const astro = await queryOne<{ id: string; designator: string }>(
      "SELECT id, designator FROM astronauts WHERE designator = $1 AND kind = 'simulated'",
      [req.params.designator],
    );
    if (!astro) return notFound(res, "Simulated astronaut");
    const days = await query(
      `SELECT day, mission_day AS "missionDay",
              total_duration_hr AS "sleepTotalHr", efficiency_pct AS "sleepEfficiencyPct",
              rem_sleep_hr AS "remHr", deep_sleep_hr AS "deepHr", light_sleep_hr AS "lightHr",
              awakenings_count AS "awakenings", quality_score AS "sleepQuality",
              grip_strength_kg AS "gripStrengthKg", muscle_strength_indicator_pct AS "muscleStrengthPct",
              muscle_soreness AS "muscleSoreness", lower_limb_function_pct AS "lowerLimbPct",
              resistance_training_min AS "resistanceMin",
              mood_score AS "mood", stress_score AS "stress", fatigue_score AS "fatigue",
              reaction_time_ms AS "reactionMs", attention_accuracy_pct AS "attentionPct",
              social_connection AS "socialConnection", workload_level AS "workload"
       FROM v_dataset_daily WHERE astronaut_id = $1 ORDER BY day ASC`,
      [astro.id],
    );
    const events = await query(
      `SELECT day, kind, label FROM mission_events
       WHERE astronaut_id = $1 AND is_synthetic ORDER BY day, kind`,
      [astro.id],
    );
    const episodes = await query(
      `SELECT start_day AS "startDay", severity_max AS "severityMax"
       FROM illness_episodes WHERE astronaut_id = $1 AND is_synthetic ORDER BY start_day`,
      [astro.id],
    );
    res.json({
      simulated: true,
      disclaimer: DISCLAIMER,
      astronautId: astro.designator,
      count: days.length,
      hasData: days.length > 0,
      days,
      events,
      illnessEpisodes: episodes,
    });
  }),
);
