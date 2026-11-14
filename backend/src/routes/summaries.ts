import { Router } from "express";
import type { ZodTypeAny } from "zod";
import { query } from "../db";
import { h, validationFail } from "../lib/api";
import { requireAuth, resolveAstronaut } from "../middleware/auth";
import { muscleSummarySchema, neuroSchema, rangeSchema, sleepSchema } from "../validators/health";

/**
 * Daily, user-entered summaries for the Sleep, Muscle & Bone and
 * Neuro/Behavioral domains. Same table pattern: upsert by (owner, day).
 * Only real submitted rows exist; lists report hasData=false when empty.
 */
export const summariesRouter = Router();
summariesRouter.use(requireAuth());

type Spec = {
  table: string;
  schema: ZodTypeAny;
  /** [column, jsonKey] pairs in stable order. */
  cols: [string, string][];
};

const SPECS: Record<"sleep" | "muscle" | "neuro", Spec> = {
  sleep: {
    table: "sleep_summaries",
    schema: sleepSchema,
    cols: [
      ["total_duration_hr", "totalDurationHr"],
      ["efficiency_pct", "efficiencyPct"],
      ["rem_sleep_hr", "remHr"],
      ["deep_sleep_hr", "deepHr"],
      ["light_sleep_hr", "lightHr"],
      ["awakenings_count", "awakenings"],
      ["quality_score", "qualityScore"],
    ],
  },
  muscle: {
    table: "muscle_bone_summaries",
    schema: muscleSummarySchema,
    cols: [
      ["grip_strength_kg", "gripStrengthKg"],
      ["muscle_strength_indicator_pct", "muscleStrengthPct"],
      ["muscle_soreness", "soreness"],
      ["lower_limb_function_pct", "lowerLimbFunctionPct"],
      ["resistance_training_min", "resistanceTrainingMin"],
    ],
  },
  neuro: {
    table: "neuro_behavioral_summaries",
    schema: neuroSchema,
    cols: [
      ["mood_score", "mood"],
      ["stress_score", "stress"],
      ["fatigue_score", "fatigue"],
      ["reaction_time_ms", "reactionTimeMs"],
      ["attention_accuracy_pct", "attentionPct"],
      ["social_connection", "socialConnection"],
      ["workload_level", "workload"],
    ],
  },
};

function mount(key: "sleep" | "muscle" | "neuro") {
  const spec = SPECS[key];
  summariesRouter.post(
    `/${key}`,
    h(async (req, res) => {
      const parsed = spec.schema.safeParse(req.body);
      if (!parsed.success) return validationFail(res, parsed.error);
      const aid = await resolveAstronaut(req.user);
      const d = parsed.data as Record<string, unknown>;
      const columns = spec.cols.map(([col]) => col).join(", ");
      const values = spec.cols.map(([_, jsonKey], i) => `$${i + 3}`);
      const updates = spec.cols
        .map(([col]) => `${col} = COALESCE(EXCLUDED.${col}, ${spec.table}.${col})`)
        .join(", ");
      await query(
        `INSERT INTO ${spec.table} (astronaut_id, day, ${columns})
         VALUES ($1,$2,${values.join(",")})
         ON CONFLICT (astronaut_id, day) DO UPDATE SET
           ${updates}, updated_at = now()`,
        [aid, d.day, ...spec.cols.map(([_, jsonKey]) => d[jsonKey] ?? null)],
      );
      await query(
        `INSERT INTO audit_log (user_id, action, entity, ip) VALUES ($1,$2,$3,$4)`,
        [req.user.id, `summary.${key}`, spec.table, req.ip ?? null],
      );
      return res.status(201).json({ ok: true, day: d.day });
    }),
  );

  summariesRouter.get(
    `/${key}`,
    h(async (req, res) => {
      const range = rangeSchema.safeParse(req.query);
      if (!range.success) return validationFail(res, range.error);
      const aid = await resolveAstronaut(req.user);
      const where = ["astronaut_id = $1", "is_synthetic = false"];
      const params: unknown[] = [aid];
      if (range.data.from) { params.push(range.data.from); where.push(`day >= $${params.length}`); }
      if (range.data.to) { params.push(range.data.to); where.push(`day <= $${params.length}`); }
      params.push(range.data.limit);
      const rows = await query<Record<string, unknown>>(
        `SELECT day, ${spec.cols.map(([col, j]) => `${col} AS "${j}"`).join(", ")}
         FROM ${spec.table} WHERE ${where.join(" AND ")}
         ORDER BY day DESC LIMIT $${params.length}`,
        params,
      );
      return res.json({ count: rows.length, hasData: rows.length > 0, days: rows });
    }),
  );
}

mount("sleep");
mount("muscle");
mount("neuro");
