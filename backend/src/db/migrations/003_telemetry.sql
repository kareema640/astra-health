-- ASTRA HEALTH · 003 telemetry (3-hourly grain, per the data reference)
-- Vertical partitioning per the approved analysis §3.1: cardiac/respiratory/
-- thermal stay in vital_observations, ECG intervals are a narrow table joined
-- by (astronaut_id, ts), activity is its own table, and cabin environment is
-- STATION-scoped (mission_id, ts) because the four cabin columns are identical
-- for every crewmate (analysis §6-9).
-- Every measurement column is nullable: missing data is NULL, never zero.

CREATE TABLE IF NOT EXISTS vital_observations (
  id                                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id                      uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  ts                                timestamptz NOT NULL,
  source                            text NOT NULL DEFAULT 'manual'
                                    CHECK (source IN ('manual', 'sensor', 'import', 'simulated')),
  device_label                      text,
  -- Cardiac (instantaneous sample)
  heart_rate_bpm                    numeric(5, 1) CHECK (heart_rate_bpm BETWEEN 20 AND 250),
  hrv_rmssd_ms                      numeric(5, 1) CHECK (hrv_rmssd_ms BETWEEN 0 AND 300),
  -- Cardiac period statistics reported alongside samples by the source sheet
  -- (kept separate from the instantaneous value; analysis §6-6).
  avg_heart_rate_bpm                numeric(5, 1) CHECK (avg_heart_rate_bpm BETWEEN 20 AND 250),
  max_heart_rate_bpm                numeric(5, 1) CHECK (max_heart_rate_bpm BETWEEN 20 AND 260),
  min_heart_rate_bpm                numeric(5, 1) CHECK (min_heart_rate_bpm BETWEEN 20 AND 260),
  systolic_bp_mmhg                  smallint CHECK (systolic_bp_mmhg BETWEEN 60 AND 260),
  diastolic_bp_mmhg                 smallint CHECK (diastolic_bp_mmhg BETWEEN 30 AND 160),
  -- Respiratory
  respiratory_rate_brmin            numeric(4, 1) CHECK (respiratory_rate_brmin BETWEEN 4 AND 60),
  spo2_pct                          numeric(4, 1) CHECK (spo2_pct BETWEEN 50 AND 100),
  respiratory_variability_rmssd_s   numeric(5, 2) CHECK (respiratory_variability_rmssd_s BETWEEN 0 AND 100),
  respiratory_pattern               text CHECK (respiratory_pattern IN (
                                      'Eupneic Regular', 'Regular Sleep', 'Exertional Tachypnea',
                                      'Mild Periodic Breathing', 'Elevated CO2 Compensation')),
  -- Thermal
  body_temperature_c                numeric(4, 1) CHECK (body_temperature_c BETWEEN 30 AND 43),
  temperature_trend                 text CHECK (temperature_trend IN (
                                      'Circadian Rising', 'Circadian Declining',
                                      'Nocturnal Nadir', 'Exercise-Induced Rise')),
  -- Dataset provenance (also meaningful for future imports)
  source_template                   text,
  is_synthetic                      boolean NOT NULL DEFAULT false,
  created_at                        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (astronaut_id, ts, source),
  CHECK (systolic_bp_mmhg IS NULL OR diastolic_bp_mmhg IS NULL
         OR systolic_bp_mmhg > diastolic_bp_mmhg)
);
CREATE INDEX IF NOT EXISTS vital_obs_owner_time_idx
  ON vital_observations (astronaut_id, ts DESC);
CREATE INDEX IF NOT EXISTS vital_obs_ts_brin ON vital_observations USING brin (ts);

CREATE TABLE IF NOT EXISTS ecg_measurements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id      uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  ts                timestamptz NOT NULL,
  source            text NOT NULL DEFAULT 'manual'
                    CHECK (source IN ('manual', 'sensor', 'import', 'simulated')),
  pr_interval_ms    smallint CHECK (pr_interval_ms BETWEEN 40 AND 400),
  qrs_duration_ms   smallint CHECK (qrs_duration_ms BETWEEN 30 AND 250),
  qt_interval_ms    numeric(6, 1) CHECK (qt_interval_ms BETWEEN 150 AND 800),
  qtc_interval_ms   numeric(6, 1) CHECK (qtc_interval_ms BETWEEN 200 AND 700),
  is_synthetic      boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (astronaut_id, ts, source)
);
CREATE INDEX IF NOT EXISTS ecg_owner_time_idx ON ecg_measurements (astronaut_id, ts DESC);

CREATE TABLE IF NOT EXISTS activity_observations (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id              uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  ts                        timestamptz NOT NULL,
  source                    text NOT NULL DEFAULT 'manual'
                            CHECK (source IN ('manual', 'sensor', 'import', 'simulated')),
  -- Vocabulary verbatim from the dataset's activity_type column.
  activity_type             text CHECK (activity_type IN (
                              'Sleep / Rest', 'Console Work / Biomedical Monitoring',
                              'Station Operations / Intra-vehicular Translation',
                              'CEVIS Cycle Ergometer')),
  steps_movement_equivalent integer CHECK (steps_movement_equivalent BETWEEN 0 AND 200000),
  active_minutes            numeric(5, 1) CHECK (active_minutes BETWEEN 0 AND 180),
  activity_intensity        text CHECK (activity_intensity IN (
                              'Sedentary', 'Sedentary-Light', 'Light', 'Vigorous')),
  exercise_sessions_count   smallint CHECK (exercise_sessions_count BETWEEN 0 AND 10),
  is_synthetic              boolean NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now(),
  UNIQUE (astronaut_id, ts, source)
);
CREATE INDEX IF NOT EXISTS activity_owner_time_idx
  ON activity_observations (astronaut_id, ts DESC);

-- Station-scoped cabin environment (one row per mission sample, not per crew).
CREATE TABLE IF NOT EXISTS environment_observations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id      uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  ts              timestamptz NOT NULL,
  source          text NOT NULL DEFAULT 'sensor'
                  CHECK (source IN ('sensor', 'import', 'simulated')),
  co2_ppm         numeric(7, 1) CHECK (co2_ppm BETWEEN 0 AND 20000),
  cabin_temp_c    numeric(4, 1) CHECK (cabin_temp_c BETWEEN 0 AND 60),
  humidity_pct    numeric(4, 1) CHECK (humidity_pct BETWEEN 0 AND 100),
  pressure_kpa    numeric(6, 2) CHECK (pressure_kpa BETWEEN 50 AND 200),
  is_synthetic    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mission_id, ts, source)
);
CREATE INDEX IF NOT EXISTS environment_mission_time_idx
  ON environment_observations (mission_id, ts DESC);
