import { Router } from "express";
import { query } from "../db";
import { h, validationFail } from "../lib/api";
import { requireAuth, resolveAstronaut } from "../middleware/auth";
import { documentSchema, rangeSchema } from "../validators/health";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth());

const METRICS: Record<string, string> = {
  heartRate: "heart_rate_bpm",
  spo2: "spo2_pct",
  respiratoryRate: "respiratory_rate_brmin",
  temperature: "body_temperature_c",
  systolic: "systolic_bp_mmhg",
  diastolic: "diastolic_bp_mmhg",
};

/**
 * Health Trends: aggregates computed ONLY from the caller's real
 * manual/sensor rows. Never includes simulated data; empty result = honest
 * "no data yet" signal for the UI.
 */
analyticsRouter.get(
  "/trends",
  h(async (req, res) => {
    const parsed = rangeSchema.safeParse({
      from: req.query["from"], to: req.query["to"], limit: req.query["limit"] ?? 1000,
    });
    if (!parsed.success) return validationFail(res, parsed.error);
    const metric = String(req.query["metric"] ?? "heartRate");
    const column = METRICS[metric];
    if (!column) {
      return res.status(400).json({
        error: {
          code: "VALIDATION",
          message: "Unknown metric",
          fields: { metric: `Supported metrics: ${Object.keys(METRICS).join(", ")}` },
        },
      });
    }
    const bucket = req.query["bucket"] === "hour" ? "hour" : "day";
    const aid = await resolveAstronaut(req.user);
    const where = ["astronaut_id = $1", "source IN ('manual','sensor')", "is_synthetic = false", `${column} IS NOT NULL`];
    const params: unknown[] = [aid];
    const q = parsed.data;
    if (q.from) { params.push(new Date(q.from).toISOString()); where.push(`ts >= $${params.length}`); }
    if (q.to) { params.push(new Date(q.to).toISOString()); where.push(`ts <= $${params.length}`); }
    const rows = await query(
      `SELECT date_trunc('${bucket}', ts) AS "t",
              round(avg(${column})::numeric, 1) AS "avg",
              min(${column}) AS "min", max(${column}) AS "max",
              count(*)::int AS "samples"
       FROM vital_observations WHERE ${where.join(" AND ")}
       GROUP BY 1 ORDER BY 1 ASC LIMIT ${Math.min(q.limit, 1000)}`,
      params,
    );
    return res.json({
      metric,
      bucket,
      generated: false,
      hasData: rows.length > 0,
      message: rows.length ? undefined : "No real measurements recorded yet — trends appear once you log readings.",
      series: rows,
    });
  }),
);

/** Overview used by dashboard-style pages: counts + triggered rule alerts. */
analyticsRouter.get(
  "/overview",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const rows = await query(
      `SELECT
         count(*) FILTER (WHERE source IN ('manual','sensor') AND is_synthetic = false)::int AS "realReadings",
         max(ts) FILTER (WHERE source IN ('manual','sensor') AND is_synthetic = false) AS "lastReadingAt"
       FROM vital_observations WHERE astronaut_id = $1`,
      [aid],
    );
    const r = (rows as { realReadings: number; lastReadingAt: string | null }[])[0] ?? {
      realReadings: 0,
      lastReadingAt: null,
    };
    const alerts = await query(
      `SELECT metric, observed_value AS "value", threshold, direction, triggered,
              evaluated_at AS "at"
       FROM alert_evaluations WHERE astronaut_id = $1 AND triggered = true
       ORDER BY evaluated_at DESC LIMIT 5`,
      [aid],
    );
    return res.json({ ...r, hasData: r.realReadings > 0, triggeredAlerts: alerts });
  }),
);

// ---------------------------------------------------------------------------
// AI layer — schema-ready, engine NOT connected (spec §6). These endpoints
// expose only what genuinely exists; nothing is presented as AI output.
// ---------------------------------------------------------------------------
export const aiRouter = Router();
aiRouter.use(requireAuth());

aiRouter.get(
  "/analyses",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const rows = await query(
      `SELECT id, window_start AS "windowStart", window_end AS "windowEnd", model,
              origin, status, findings, risk_score AS "riskScore",
              created_at AS "createdAt", completed_at AS "completedAt"
       FROM ai_analyses WHERE astronaut_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [aid],
    );
    return res.json({
      engineConnected: false,
      hasData: rows.length > 0,
      message: rows.length
        ? undefined
        : "No AI analyses exist yet. The analysis engine is not connected — recorded data is always shown as raw measurements.",
      analyses: rows,
    });
  }),
);

aiRouter.post("/analyses/run", (_req, res) => {
  // Honest refusal instead of fabricated insight (spec §6).
  res.status(503).json({
    error: {
      code: "AI_NOT_CONNECTED",
      message:
        "The AI analysis engine is not implemented or connected yet, so no analysis can be produced.",
    },
  });
});

aiRouter.get(
  "/recommendations",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const rows = await query(
      `SELECT id, kind, body, source_reference AS "sourceReference",
              reviewed_by AS "reviewedBy", created_at AS "createdAt"
       FROM recommendations WHERE astronaut_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [aid],
    );
    return res.json({
      hasData: rows.length > 0,
      message: rows.length
        ? undefined
        : "No recommendations exist yet. Recommendations are only shown when a reviewed source is attached.",
      recommendations: rows,
    });
  }),
);

aiRouter.get(
  "/sources",
  h(async (_req, res) => {
    const rows = await query("SELECT code, title, publisher, edition, url FROM clinical_sources ORDER BY code");
    res.json({ count: rows.length, sources: rows });
  }),
);

// ---------------------------------------------------------------------------
// Uploaded report references (metadata; content storage is a later stage).
// ---------------------------------------------------------------------------
export const documentsRouter = Router();
documentsRouter.use(requireAuth());

documentsRouter.get(
  "/",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const rows = await query(
      `SELECT id, kind, filename, mime, bytes, status, uploaded_at AS "uploadedAt"
       FROM uploaded_documents WHERE astronaut_id = $1 ORDER BY uploaded_at DESC`,
      [aid],
    );
    return res.json({ count: rows.length, documents: rows });
  }),
);

documentsRouter.post(
  "/",
  h(async (req, res) => {
    const parsed = documentSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);
    const aid = await resolveAstronaut(req.user);
    const d = parsed.data;
    const [row] = await query(
      `INSERT INTO uploaded_documents (astronaut_id, kind, filename, mime, bytes, sha256)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (astronaut_id, kind, filename) DO UPDATE SET
         mime = COALESCE(EXCLUDED.mime, uploaded_documents.mime),
         bytes = COALESCE(EXCLUDED.bytes, uploaded_documents.bytes),
         sha256 = COALESCE(EXCLUDED.sha256, uploaded_documents.sha256)
       RETURNING id, kind, filename, status`,
      [aid, d.kind, d.filename, d.mime, d.bytes, d.sha256],
    );
    if (!row) {
      return res.status(500).json({ error: { code: "INTERNAL", message: "Could not save the reference" } });
    }
    await query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, ip)
       VALUES ($1,'document.link','uploaded_documents',$2,$3)`,
      [req.user.id, row.id, req.ip ?? null],
    );
    return res.status(201).json(row);
  }),
);

// ---------------------------------------------------------------------------
// Mission registry (non-PHI reference data).
// ---------------------------------------------------------------------------
export const missionsRouter = Router();
missionsRouter.use(requireAuth());

missionsRouter.get(
  "/",
  h(async (_req, res) => {
    const missions = await query(
      `SELECT id, code, name, start_date AS "startDate", end_date AS "endDate", status
       FROM missions ORDER BY start_date DESC`,
    );
    const phases = await query(
      `SELECT m.id AS "missionId", p.name, p.day_from AS "dayFrom", p.day_to AS "dayTo"
       FROM mission_phases p JOIN missions m ON m.id = p.mission_id
       ORDER BY m.start_date DESC, p.day_from`,
    );
    res.json({
      missions: missions.map((m) => ({ ...m, phases: phases.filter((p) => p.missionId === m.id) })),
    });
  }),
);
