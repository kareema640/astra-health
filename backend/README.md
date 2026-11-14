# ASTRA HEALTH — Auth API (Stage 1: Login & Sign Up)

Node/Express + PostgreSQL API providing registration, login, rotating
refresh-token sessions, logout and the current-account endpoint. It covers
**only** the Login / Sign Up module; health modules arrive in later stages and
will reference the same `users.id`.

## Requirements

- Node 20+ or Bun 1.2+
- PostgreSQL 16 with a database + role (local dev used `astra_health` / `astra`)

## Configure

1. `cp .env.example .env`
2. Fill in `DATABASE_URL` and generate a real secret:
   `openssl rand -base64 48` → `JWT_SECRET`
3. **Never commit `.env`** — it is ignored by git (see repo `.gitignore`).

## Run

```bash
cd backend
bun install            # or: npm install
bun run migrate        # applies src/db/migrations/001_auth.sql (needs psql)
bun run dev            # API on http://localhost:3001 (bun --watch)
# npm equivalents: npm run migrate / npm run start
```

The frontend dev server talks to `http://localhost:3001` by default; override
with `VITE_API_URL` (Lovable environment variable) in hosted deployments.

## API

| Method | Path                 | Body                                          | Result |
| ------ | -------------------- | --------------------------------------------- | ------ |
| POST   | `/api/auth/register` | fullName, email, password, confirmPassword, astronautId | 201 + tokens · 400 fields · 409 conflict |
| POST   | `/api/auth/login`    | astronautId (ID **or** email), password        | 200 + tokens · 401 |
| POST   | `/api/auth/refresh`  | refreshToken                                   | 200 new pair · 401 |
| POST   | `/api/auth/logout`   | refreshToken                                   | 204 (revokes server-side) |
| GET    | `/api/auth/me`       | — (Bearer access token)                        | 200 user · 401 |
| GET    | `/api/health`        | —                                              | 200 |

Security: bcrypt (cost 12) hashes only; JWT access tokens (15 min);
opaque refresh tokens stored **hashed**, rotated on every refresh, revoked on
logout; rate limiting on `/api/auth/*`; CORS allow-list via `CORS_ORIGINS`.

## Test

```bash
# local test database first, e.g.:
#   createdb astra_health_test && cp .env.example .env.test  (point DATABASE_URL at it)
bun run test           # 15 vitest + supertest integration checks
```

## Schema

`users` (id uuid PK · email unique-lower · password_hash · full_name ·
astronaut_id unique · timestamps) and `sessions` (FK → users, refresh token
hash, expiry, revocation). Future health tables add `user_id uuid REFERENCES
users(id)` — authentication data stays isolated from clinical records.
