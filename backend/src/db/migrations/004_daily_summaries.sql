-- ASTRA HEALTH · 004 daily summaries, events, illness episodes
-- These columns in the data reference are CONSTANT within each
-- (astronaut, mission_day) — verified during profiling — so their true grain is
-- daily, not 3-hourly. Storing one row per day removes the duplication and
-- keeps analytics honest.

CREATE TABLE IF NOT EXISTS sleep_summaries (
  astronaut_id          uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  day                   date NOT NULL,
  total_duration_hr     numeric(4, 2) CHECK (total_duration_hr BETWEEN 0 AND 24),
  efficiency_pct        numeric(4, 1) CHECK (efficiency_pct BETWEEN 0 AND 100),
  rem_sleep_hr          numeric(4, 2) CHECK (rem_sleep_hr BETWEEN 0 AND 24),
  deep_sleep_hr         numeric(4, 2) CHECK (deep_sleep_hr BETWEEN 0 AND 24),
  light_sleep_hr        numeric(4, 2) CHECK (light_sleep_hr BETWEEN 0 AND 24),
  awakenings_count      smallint CHECK (awakenings_count BETWEEN 0 AND 200),
  quality_score         numeric(3, 1) CHECK (quality_score BETWEEN 0 AND 10),
  -- NOTE: no stage-sum CHECK: the source data leaves ~0.13 h unaccounted
  -- (analysis §6-12) and the spec for the remainder is pending.
  source                text NOT NULL DEFAULT 'manual'
                        CHECK (source IN ('manual', 'sensor', 'import', 'simulated')),
  is_synthetic          boolean NOT NULL DEFAULT false,
  updated_at            timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (astronaut_id, day)
);
CREATE INDEX IF NOT EXISTS sleep_owner_day_idx ON sleep_summaries (astronaut_id, day DESC);

CREATE TABLE IF NOT EXISTS muscle_bone_summaries (
  astronaut_id                  uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  day                           date NOT NULL,
  grip_strength_kg              numeric(4, 1) CHECK (grip_strength_kg BETWEEN 0 AND 150),
  muscle_strength_indicator_pct numeric(4, 1) CHECK (muscle_strength_indicator_pct BETWEEN 0 AND 100),
  muscle_soreness               numeric(3, 1) CHECK (muscle_soreness BETWEEN 0 AND 10),
  lower_limb_function_pct       numeric(4, 1) CHECK (lower_limb_function_pct BETWEEN 0 AND 100),
  resistance_training_min       numeric(5, 1) CHECK (resistance_training_min BETWEEN 0 AND 600),
  source                        text NOT NULL DEFAULT 'manual'
                                CHECK (source IN ('manual', 'sensor', 'import', 'simulated')),
  is_synthetic                  boolean NOT NULL DEFAULT false,
  updated_at                    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (astronaut_id, day)
);

CREATE TABLE IF NOT EXISTS neuro_behavioral_summaries (
  astronaut_id           uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  day                    date NOT NULL,
  mood_score             numeric(3, 1) CHECK (mood_score BETWEEN 0 AND 10),
  stress_score           numeric(3, 1) CHECK (stress_score BETWEEN 0 AND 10),
  fatigue_score          numeric(3, 1) CHECK (fatigue_score BETWEEN 0 AND 10),
  reaction_time_ms       integer CHECK (reaction_time_ms BETWEEN 50 AND 5000),
  attention_accuracy_pct numeric(4, 1) CHECK (attention_accuracy_pct BETWEEN 0 AND 100),
  social_connection      numeric(2, 1) CHECK (social_connection BETWEEN 1 AND 5),
  workload_level         text CHECK (workload_level IN ('Moderate', 'Moderate-High', 'High')),
  source                 text NOT NULL DEFAULT 'manual'
                         CHECK (source IN ('manual', 'sensor', 'import', 'simulated')),
  is_synthetic           boolean NOT NULL DEFAULT false,
  updated_at             timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (astronaut_id, day)
);

-- Free-text event columns from the sheet normalized into typed rows
-- (analysis §6-10). Labels preserved verbatim; kind is the controlled part.
CREATE TABLE IF NOT EXISTS mission_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id  uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  day           date NOT NULL,
  kind          text NOT NULL CHECK (kind IN ('exercise', 'sleep_schedule', 'environmental')),
  label         text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 200),
  is_synthetic  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (astronaut_id, day, kind, label)
);
CREATE INDEX IF NOT EXISTS mission_events_owner_day_idx
  ON mission_events (astronaut_id, day DESC);

-- Illness/episode windows. The sheet's severity semantics are pending
-- confirmation (analysis §6-1/2): we store one episode per distinct
-- (astronaut, episode_start_day) observed with simulated_illness=1 and keep
-- the max severity seen in its window; nothing is inferred beyond that.
CREATE TABLE IF NOT EXISTS illness_episodes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id  uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  start_day     integer NOT NULL CHECK (start_day >= 1),
  severity_max  numeric(4, 3) CHECK (severity_max BETWEEN 0 AND 1),
  flag          boolean NOT NULL DEFAULT true,     -- simulated_illness = 1
  is_synthetic  boolean NOT NULL DEFAULT true,     -- provenance: dataset rows
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (astronaut_id, start_day)
);
