# ASTRA HEALTH — Platform Backend

PostgreSQL 16 + Express (Bun runtime) API powering authentication, the
collected health profile, manual vital records, daily summaries, analytics
over real data only, an honest AI placeholder layer, and the simulated
research dataset.

## Layout

```
backend/
├── src/
│   ├── app.ts               # Express app: security, CORS, rate limits, routers
│   ├── env.ts               # zod-validated environment
│   ├── db.ts                # pg pool + query helpers
│   ├── db/migrate.ts        # versioned migration runner (schema_migrations)
│   ├── db/migrations/       # 001 auth · 002 identity/profile · 003 telemetry
│   │                        # 004 daily summaries · 005 alerts/AI · 006 dataset views
│   ├── middleware/auth.ts   # bearer JWT + role guard, astronaut binding
│   ├── validation.ts        # auth schemas
│   ├── validators/health.ts # onboarding sync + observations + summaries schemas
│   ├── routes-auth.ts       # register/login/refresh/logout/me
│   └── routes/              # onboarding · vitals · heart · summaries
│                            # analytics(+ai/documents/missions) · dataset
├── scripts/import-dataset.ts # simulated workbook importer (idempotent)
└── tests/                    # 43 integration tests (real PostgreSQL)
```

## Setup

```bash
cd backend
createdb astra_health && createdb astra_health_test
cp .env.example .env               # set DATABASE_URL + JWT_SECRET (openssl rand -base64 48)
cp .env.example .env.test          # point at astra_health_test
bun install
bun run migrate                    # or just start the server: migrations run on boot
bun run dev                        # http://localhost:3001
```

Security (unchanged from the auth module): bcrypt cost-12 hashes only; 15-min
JWT access tokens; opaque refresh tokens stored hashed, rotated on every
refresh, revoked on logout; rate limiting; CORS allow-list via `CORS_ORIGINS`.
**Never commit `.env`** — ignored by the repo `.gitignore`.

Frontend wiring: set `VITE_API_URL` (e.g. `http://localhost:3001`) in
`.env.local`; make sure `CORS_ORIGINS` contains the browser origin.

## Dataset import (simulated cohort)

```bash
bun scripts/import-dataset.ts /path/to/astra_health_unified_dataset_480rows.csv
# imported: vitals=14400 ecg=14400 activity=14400 environment=240
#           sleep=1800 muscle=1800 neuro=1800 events=5400 astronauts=60
```

Every imported row carries `is_synthetic = true`, `source = 'simulated'` and
its `source_template`; astronauts are `kind = 'simulated'` bound to mission
`ASTRA-SIM-2026` (2026-03-01 → 2026-03-30, phases per the workbook).
Simulated data is served only under `/api/dataset` (always with
`simulated: true` + disclaimer) and can never appear in personal endpoints —
enforced by schema grain, provenance flags and dedicated queries (test
covered).

## Endpoints

| Area | Route | Notes |
| --- | --- | --- |
| Auth | `POST /api/auth/register·login·refresh·logout`, `GET /api/auth/me` | unchanged behaviour; register also backs each account with an astronaut identity |
| Profile | `POST /api/onboarding/sync`, `GET /api/onboarding/snapshot` | idempotent mirror of the frontend store; snapshot returns the exact OnboardingData shape (strings, `""` = unanswered) |
| Vitals | `POST /api/vitals/observations`, `GET /api/vitals/observations[?from&to]`, `GET …/latest`, `GET …/:id` | manual entries only; row-isolated (other accounts get 404); values above/below the user's own thresholds produce stored rule evaluations |
| Heart | `GET /api/heart/recovery`, `PUT /api/heart/alerts` | profile + rules + recent real readings + evaluation history |
| Summaries | `POST/GET /api/summaries/sleep·muscle·neuro` | one row per (user, day); partial updates merge without dropping values |
| Analytics | `GET /api/analytics/trends?metric=&bucket=day|hour&from&to`, `GET /api/analytics/overview` | computed only from the caller's real manual/sensor rows; empty result = honest "no data yet" |
| AI | `GET /api/ai/analyses`, `POST /api/ai/analyses/run`, `GET /api/ai/recommendations`, `GET /api/ai/sources` | engine NOT connected: lists report `hasData:false`, run returns 503 `AI_NOT_CONNECTED`; nothing is ever auto-invented |
| Documents | `GET/POST /api/documents` | file references (metadata only until the storage stage) |
| Missions | `GET /api/missions` | registry + phases (non-PHI) |
| Dataset | `GET /api/dataset/meta`, `GET …/astronauts`, `GET …/astronauts/:id/observations`, `GET …/astronauts/:id/daily` | simulated cohort, auth required |

Health endpoints require `Authorization: Bearer <access token>`.

## Data rules (from the spec)

- Missing answers stay `NULL` — validation maps `""` → null everywhere; empty
  states return `hasData: false`. Nothing is presented as zero when unknown.
- Controlled vocabularies are enforced with CHECK constraints using the
  exact values observed in the data reference and the existing forms.
- `is_synthetic` + `source` provenance on every measurement table;
  `source_template` preserved.
- Audit log records actions only, never clinical values.
- Recommendations require `source_reference` + `reviewed_by` at the schema
  level; AI tables exist but are only written by explicitly reviewed
  processes.

## Tests

```bash
cd backend && bunx vitest run
# 43 tests: auth (15), onboarding sync/restore, vitals CRUD + alert engine,
# summaries merge rules, analytics honesty, AI 503/empty states, documents,
# dataset import + strict simulated/personal separation, user isolation.
```
