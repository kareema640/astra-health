-- ASTRA HEALTH · 006 dataset read views
-- Wide convenience views over the partitioned telemetry tables for the
-- SIMULATED dataset only (provenance-filtered). They are read-only surfaces
-- for the demo/AI-training endpoints; personal data never appears in them.

-- mission_day is derived, not stored (analysis §6-14): day 1 = mission start.
CREATE OR REPLACE VIEW v_dataset_samples AS
SELECT
  v.astronaut_id,
  a.designator,
  v.ts,
  (v.ts::date - m.start_date) + 1                    AS mission_day,
  p.name                                             AS phase,
  v.heart_rate_bpm, v.hrv_rmssd_ms,
  v.avg_heart_rate_bpm, v.max_heart_rate_bpm, v.min_heart_rate_bpm,
  v.systolic_bp_mmhg, v.diastolic_bp_mmhg,
  e.pr_interval_ms                                   AS ecg_pr_interval_ms,
  e.qrs_duration_ms                                  AS ecg_qrs_duration_ms,
  e.qt_interval_ms                                   AS ecg_qt_interval_ms,
  e.qtc_interval_ms                                  AS ecg_qtc_interval_ms,
  v.respiratory_rate_brmin, v.spo2_pct, v.respiratory_pattern,
  v.respiratory_variability_rmssd_s,
  v.body_temperature_c, v.temperature_trend,
  act.activity_type, act.steps_movement_equivalent, act.active_minutes,
  act.activity_intensity, act.exercise_sessions_count,
  env.co2_ppm, env.cabin_temp_c                      AS cabin_temperature_c,
  env.humidity_pct                                   AS relative_humidity_pct,
  env.pressure_kpa                                   AS cabin_pressure_kpa,
  v.source_template,
  v.is_synthetic
FROM vital_observations v
JOIN astronauts a ON a.id = v.astronaut_id
LEFT JOIN missions m ON m.id = a.mission_id
LEFT JOIN mission_phases p
  ON p.mission_id = m.id
 AND ((v.ts::date - m.start_date) + 1) BETWEEN p.day_from AND p.day_to
LEFT JOIN ecg_measurements e
  ON e.astronaut_id = v.astronaut_id AND e.ts = v.ts AND e.source = v.source
LEFT JOIN activity_observations act
  ON act.astronaut_id = v.astronaut_id AND act.ts = v.ts AND act.source = v.source
LEFT JOIN environment_observations env
  ON env.mission_id = a.mission_id AND env.ts = v.ts
WHERE v.is_synthetic;

CREATE OR REPLACE VIEW v_dataset_daily AS
SELECT
  sl.astronaut_id,
  sl.day,
  ((sl.day - m.start_date) + 1)                      AS mission_day,
  sl.total_duration_hr, sl.efficiency_pct, sl.rem_sleep_hr, sl.deep_sleep_hr,
  sl.light_sleep_hr, sl.awakenings_count, sl.quality_score,
  mb.grip_strength_kg, mb.muscle_strength_indicator_pct, mb.muscle_soreness,
  mb.lower_limb_function_pct, mb.resistance_training_min,
  nb.mood_score, nb.stress_score, nb.fatigue_score, nb.reaction_time_ms,
  nb.attention_accuracy_pct, nb.social_connection, nb.workload_level
FROM sleep_summaries sl
JOIN astronauts a ON a.id = sl.astronaut_id
LEFT JOIN missions m ON m.id = a.mission_id
LEFT JOIN muscle_bone_summaries mb ON mb.astronaut_id = sl.astronaut_id AND mb.day = sl.day
LEFT JOIN neuro_behavioral_summaries nb ON nb.astronaut_id = sl.astronaut_id AND nb.day = sl.day
WHERE sl.is_synthetic;
