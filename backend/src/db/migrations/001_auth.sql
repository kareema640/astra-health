-- ASTRA HEALTH · Stage 1: authentication module only.
-- Future health tables (vitals, telemetry, AI assessments) reference users.id.
-- Auth rows are kept in dedicated tables, separate from any clinical data.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          text NOT NULL,
  password_hash  text NOT NULL,
  full_name      text NOT NULL,
  astronaut_id   text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness without inventing a normalized column.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key
  ON users (lower(email));

-- Login identifier (the Sign Up form's "Astronaut ID"). Exact match, unique.
CREATE UNIQUE INDEX IF NOT EXISTS users_astronaut_id_key
  ON users (astronaut_id);

COMMENT ON COLUMN users.password_hash IS 'bcrypt (cost 12) hash; the plaintext password is never stored.';

-- Server-side sessions backing rotating refresh tokens.
-- Only a SHA-256 hash of the token is stored, never the token itself.
CREATE TABLE IF NOT EXISTS sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  refresh_token_hash  text NOT NULL UNIQUE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  expires_at          timestamptz NOT NULL,
  revoked_at          timestamptz,
  replaced_by_hash    text
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);

COMMENT ON TABLE sessions IS 'Logout revokes the session row; expired or revoked sessions cannot mint new tokens.';

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
