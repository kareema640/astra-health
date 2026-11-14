-- ASTRA HEALTH — migration 008: user-managed Mission Planner and Activity log.
-- The existing `missions` registry is the shared cohort catalogue (unique
-- codes, referenced by astronauts.mission_id) and `activity_observations`
-- carries dataset-vocabulary telemetry; neither fits free-form, per-user
-- planner records. These tables are genuinely new and astronaut-scoped so
-- every row belongs to exactly one authenticated user.

CREATE TABLE IF NOT EXISTS planner_missions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id  uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  title         text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 140),
  description   text CHECK (description IS NULL OR char_length(description) <= 500),
  category      text NOT NULL DEFAULT 'Vital Check'
                CHECK (category IN ('Vital Check','Exercise','Nutrition','EVA Prep','Rest')),
  time_utc      text NOT NULL DEFAULT '12:00 UTC'
                CHECK (char_length(time_utc) <= 24),
  scheduled_day date CHECK (scheduled_day IS NULL OR scheduled_day >= CURRENT_DATE - INTERVAL '3650 days'),
  duration_min  integer CHECK (duration_min IS NULL OR duration_min BETWEEN 1 AND 1440),
  priority      text NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low','medium','high')),
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','in_progress','done')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS planner_missions_owner_idx
  ON planner_missions (astronaut_id, status, created_at);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id  uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  name          text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 140),
  focus         text NOT NULL DEFAULT 'Resistance'
                CHECK (focus IN ('Resistance','Cardio','Mobility','Core')),
  duration_min  integer NOT NULL CHECK (duration_min BETWEEN 1 AND 600),
  session_day   date CHECK (session_day IS NULL OR session_day >= CURRENT_DATE - INTERVAL '3650 days'),
  notes         text CHECK (notes IS NULL OR char_length(notes) <= 500),
  completed     boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workout_sessions_owner_idx
  ON workout_sessions (astronaut_id, session_day DESC, created_at DESC);
