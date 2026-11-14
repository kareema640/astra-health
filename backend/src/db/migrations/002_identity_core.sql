-- ASTRA HEALTH · 002 identity, missions, clinical profile & app configuration
-- Extends the auth module (001) without altering its behaviour: additive only.
-- Field names mirror the data reference (unified dataset CSV) and the existing
-- frontend forms exactly; nothing here invents clinical fields.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'astronaut'
    CHECK (role IN ('astronaut', 'flight_surgeon', 'mission_control', 'admin')),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'invited', 'disabled')),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Mission registry: real deployments need per-mission windows, not hard-coded
-- day 1-30 (analysis §6-14). mission_days are derived from start_date.
CREATE TABLE IF NOT EXISTS missions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE CHECK (code ~ '^[A-Za-z0-9_-]{1,32}$'),
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  start_date  date NOT NULL,
  end_date    date CHECK (end_date IS NULL OR end_date >= start_date),
  status      text NOT NULL DEFAULT 'active'
              CHECK (status IN ('planned', 'active', 'completed')),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_phases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  -- Vocabulary verbatim from the dataset's mission_phase column.
  name        text NOT NULL CHECK (name IN (
                'Launch & Docking', 'Acute Adaptation',
                'Nominal Operations', 'Pre-Return Preparation')),
  day_from    integer NOT NULL CHECK (day_from >= 1),
  day_to      integer NOT NULL CHECK (day_to >= day_from),
  UNIQUE (mission_id, name)
);

-- One identity row per human (or simulated) astronaut. user_id links a login
-- account to their record; simulated dataset rows keep user_id NULL.
-- This keeps one user identity (users.id) across every module (spec §2).
CREATE TABLE IF NOT EXISTS astronauts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  designator          text NOT NULL UNIQUE CHECK (designator ~ '^[A-Za-z0-9_-]{1,32}$'),
  display_name        text,
  user_id             uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  mission_id          uuid REFERENCES missions(id) ON DELETE SET NULL,
  kind                text NOT NULL DEFAULT 'real' CHECK (kind IN ('real', 'simulated')),
  -- UI shows "Nov 11, 2026"-style strings; preserved as entered.
  join_date_display   text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS astronauts_mission_idx ON astronauts (mission_id);

-- Basic Information step (astronaut_profiles.age etc.) + demographics that the
-- form actually collects. Height/weight are kept as entered with their unit
-- (the UI supports cm/ft-in and kg/lb, and ft-in values like 5'9" are strings).
CREATE TABLE IF NOT EXISTS astronaut_profiles (
  astronaut_id  uuid PRIMARY KEY REFERENCES astronauts(id) ON DELETE CASCADE,
  age           smallint CHECK (age BETWEEN 0 AND 130),
  sex           text CHECK (sex IN ('male', 'female', 'other')),
  height        text,
  height_unit   text CHECK (height_unit IN ('cm', 'ftin')),
  weight        text,
  weight_unit   text CHECK (weight_unit IN ('kg', 'lb')),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Vital Signs step: self-reported clinical baseline. Empty answers stay NULL
-- (never zeroed, spec §6). bp_unknown / measured_with_device keep the UI's
-- honesty flags.
CREATE TABLE IF NOT EXISTS onboarding_vitals_baselines (
  astronaut_id         uuid PRIMARY KEY REFERENCES astronauts(id) ON DELETE CASCADE,
  systolic_mmhg        smallint CHECK (systolic_mmhg BETWEEN 60 AND 260),
  diastolic_mmhg       smallint CHECK (diastolic_mmhg BETWEEN 30 AND 160),
  bp_unknown           boolean NOT NULL DEFAULT false,
  respiratory_rate     smallint CHECK (respiratory_rate BETWEEN 4 AND 60),
  spo2_pct             smallint CHECK (spo2_pct BETWEEN 50 AND 100),
  measured_with_device boolean NOT NULL DEFAULT false,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CHECK (systolic_mmhg IS NULL OR diastolic_mmhg IS NULL
         OR systolic_mmhg > diastolic_mmhg)
);

-- Heart & Recovery step. conditions uses the UI's exact vocabulary
-- (logic.ts HeartCondition); empty array = never asked.
CREATE TABLE IF NOT EXISTS onboarding_heart_recovery (
  astronaut_id   uuid PRIMARY KEY REFERENCES astronauts(id) ON DELETE CASCADE,
  alert_enabled  boolean NOT NULL DEFAULT true,
  resting_hr     smallint CHECK (resting_hr BETWEEN 20 AND 250),
  conditions     text[] NOT NULL DEFAULT '{}',
  alert_above    smallint CHECK (alert_above BETWEEN 40 AND 250),
  alert_below    smallint CHECK (alert_below BETWEEN 20 AND 200),
  sleep_target   text CHECK (sleep_target IN ('lt5', '5-6', '7-8', '9plus')),
  hydration      text CHECK (hydration IN ('lt1', '1-2', '2-3', '3plus')),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (conditions <@ ARRAY['none', 'arrhythmia', 'hypertension', 'other']::text[])
);

-- Muscle & Bone step. Report uploads are represented as documents below.
CREATE TABLE IF NOT EXISTS onboarding_muscle_bone (
  astronaut_id    uuid PRIMARY KEY REFERENCES astronauts(id) ON DELETE CASCADE,
  muscle_mass_kg  numeric(5, 1) CHECK (muscle_mass_kg > 0),
  bone_density    text CHECK (bone_density IN ('normal', 'osteopenia', 'osteoporosis', 'unknown')),
  emg_group       text CHECK (emg_group IN ('biceps', 'quadriceps', 'calf', 'core', 'forearm')),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- File references only — the current UI keeps names, never bytes; content is
-- uploaded in a later stage (storage bucket + sha256 columns reserved here).
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id  uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  kind          text NOT NULL CHECK (kind IN ('emg_report', 'dexa_report', 'avatar_photo', 'other')),
  filename      text NOT NULL CHECK (char_length(filename) BETWEEN 1 AND 255),
  mime          text,
  bytes         bigint CHECK (bytes IS NULL OR bytes >= 0),
  sha256        text CHECK (sha256 IS NULL OR sha256 ~ '^[0-9a-f]{64}$'),
  storage_path  text,
  status        text NOT NULL DEFAULT 'metadata_only'
                CHECK (status IN ('metadata_only', 'stored', 'missing')),
  uploaded_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS uploaded_documents_owner_idx
  ON uploaded_documents (astronaut_id, kind);
-- One reference row per (owner, kind, filename): keeps idempotent syncs clean.
CREATE UNIQUE INDEX IF NOT EXISTS uploaded_documents_dedup_idx
  ON uploaded_documents (astronaut_id, kind, filename);

-- Avatar selection (Choose Your Avatar step) — mirrors OnboardingData.avatar
-- exactly. The custom photo data-URL is NOT stored server-side (size/privacy);
-- only the flag and an optional filename reference.
CREATE TABLE IF NOT EXISTS avatar_settings (
  astronaut_id          uuid PRIMARY KEY REFERENCES astronauts(id) ON DELETE CASCADE,
  character_preset      text NOT NULL CHECK (character_preset IN
                        ('explorer', 'pilot', 'scientist', 'commander', 'medic')),
  skin                  text NOT NULL CHECK (skin IN ('purple', 'green', 'blue', 'yellow', 'teal')),
  accent                text NOT NULL CHECK (accent IN ('red', 'blue', 'gold', 'green', 'white')),
  suit                  text NOT NULL CHECK (suit IN ('eva-white', 'launch-orange', 'flight-blue', 'lunar-gray')),
  visor                 text NOT NULL CHECK (visor IN ('clear', 'gold', 'tinted')),
  callsign              text CHECK (callsign IS NULL OR char_length(callsign) <= 24),
  from_photo            boolean NOT NULL DEFAULT false,
  custom_photo_filename text,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Which steps were finished vs skipped — the UI's progress semantics
-- (a preselected default only counts once its step is "done").
CREATE TABLE IF NOT EXISTS onboarding_progress (
  astronaut_id  uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  section       text NOT NULL CHECK (section IN ('basic', 'vitals', 'heart', 'muscle', 'avatar')),
  status        text NOT NULL CHECK (status IN ('done', 'skipped')),
  recorded_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (astronaut_id, section)
);

-- Operational audit trail: who did what, when, from where.
-- Deliberately stores NO clinical payload values (spec §7: logs without
-- sensitive personal or medical information).
CREATE TABLE IF NOT EXISTS audit_log (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  entity      text,
  entity_id   text,
  ip          inet,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_user_idx ON audit_log (user_id, created_at DESC);
