-- ASTRA HEALTH · 005 alert rules, evaluations, AI-analysis scaffold, views
--
-- Per spec §6, NO AI functionality is claimed live: ai_analyses and
-- recommendations are schema + service-ready only. Every row written into them
-- must carry an explicit `origin` ('manual_review', 'rule_engine', or a named
-- model) — nothing is auto-invented.

-- Threshold rules derived from the user's own Heart & Recovery answers
-- (alert_above / alert_below / resting_hr). One rule row per astronaut.
CREATE TABLE IF NOT EXISTS alert_rules (
  astronaut_id      uuid PRIMARY KEY REFERENCES astronauts(id) ON DELETE CASCADE,
  hr_above          numeric(5, 1) CHECK (hr_above BETWEEN 40 AND 250),
  hr_below          numeric(5, 1) CHECK (hr_below BETWEEN 20 AND 200),
  spo2_below        numeric(4, 1) CHECK (spo2_below BETWEEN 50 AND 100),
  temp_above_c      numeric(4, 1) CHECK (temp_above_c BETWEEN 30 AND 43),
  enabled           boolean NOT NULL DEFAULT true,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Deterministic, rule-based evaluations of REAL observations only. `triggered`
-- is computed by the API when a measurement is recorded; it never fabricates
-- history (spec §6: calculated metrics are marked as such via origin).
CREATE TABLE IF NOT EXISTS alert_evaluations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id    uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  observation_id  uuid REFERENCES vital_observations(id) ON DELETE CASCADE,
  evaluated_at    timestamptz NOT NULL DEFAULT now(),
  metric          text NOT NULL
                  CHECK (metric IN ('heart_rate', 'spo2', 'body_temperature')),
  observed_value  numeric NOT NULL,
  threshold       numeric NOT NULL,
  direction       text NOT NULL CHECK (direction IN ('above', 'below')),
  triggered       boolean NOT NULL,
  origin          text NOT NULL DEFAULT 'rule_engine' CHECK (origin = 'rule_engine')
);
CREATE INDEX IF NOT EXISTS alert_eval_owner_time_idx
  ON alert_evaluations (astronaut_id, evaluated_at DESC);

-- AI layer (Stage 4 — schema ready, engine NOT connected yet, spec §6).
CREATE TABLE IF NOT EXISTS ai_analyses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id    uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  mission_id      uuid REFERENCES missions(id) ON DELETE SET NULL,
  window_start    timestamptz NOT NULL,
  window_end      timestamptz NOT NULL,
  model           text,                          -- named model when a real one runs
  origin          text NOT NULL DEFAULT 'manual_review'
                  CHECK (origin IN ('manual_review', 'rule_engine', 'model')),
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  findings        jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_score      numeric(4, 3) CHECK (risk_score BETWEEN 0 AND 1),
  created_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  CHECK (window_end > window_start)
);
CREATE INDEX IF NOT EXISTS ai_analyses_owner_idx
  ON ai_analyses (astronaut_id, created_at DESC);

-- Recommendations. Every row is tied to an analysis and MUST name its source
-- (spec §6: medical content based on a defined, reviewed source, never
-- invented). No rows exist unless created by a reviewed process.
CREATE TABLE IF NOT EXISTS recommendations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id       uuid REFERENCES ai_analyses(id) ON DELETE CASCADE,
  astronaut_id      uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  kind              text NOT NULL CHECK (kind IN ('monitoring', 'activity', 'hydration', 'sleep', 'clinical')),
  body              text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  source_reference  text NOT NULL CHECK (char_length(source_reference) >= 3),
  reviewed_by       text NOT NULL,               -- required: human/protocol review
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS recommendations_owner_idx
  ON recommendations (astronaut_id, created_at DESC);

-- Reviewed clinical decision-support sources referenced by recommendations.
CREATE TABLE IF NOT EXISTS clinical_sources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  title       text NOT NULL,
  publisher   text NOT NULL,
  edition     text,
  url         text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Analytics / Health Trends: one row per (astronaut, metric, day) derived from
-- REAL observations. Populated by an explicit rollup call, never by default,
-- so the Trends page can distinguish "no data" from zero (spec §6).
CREATE TABLE IF NOT EXISTS metric_daily_rollups (
  astronaut_id  uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  day           date NOT NULL,
  metric        text NOT NULL,
  value_avg     numeric,
  value_min     numeric,
  value_max     numeric,
  sample_count  integer NOT NULL DEFAULT 0 CHECK (sample_count >= 0),
  source        text NOT NULL DEFAULT 'computed' CHECK (source = 'computed'),
  computed_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (astronaut_id, day, metric)
);

-- Latest reading per astronaut per metric, computed on demand from real rows.
CREATE OR REPLACE VIEW v_latest_vitals AS
SELECT DISTINCT ON (astronaut_id)
  astronaut_id, ts AS measured_at,
  heart_rate_bpm, spo2_pct, body_temperature_c,
  respiratory_rate_brmin, systolic_bp_mmhg, diastolic_bp_mmhg,
  source
FROM vital_observations
WHERE source IN ('manual', 'sensor')
ORDER BY astronaut_id, ts DESC;
