import { z } from "zod";

const dayStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" });

const blankToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

/**
 * User-managed Mission Planner entries (migration 008). Patch schemas are
 * written out explicitly — .partial() over defaults would silently rewrite
 * fields the client did not send.
 */
export const plannerMissionSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    description: z.preprocess(blankToNull, z.string().max(500).nullish()),
    category: z.enum(["Vital Check", "Exercise", "Nutrition", "EVA Prep", "Rest"]).default("Vital Check"),
    timeUtc: z.preprocess(
      (v) => (v === undefined || v === null ? "12:00 UTC" : String(v).trim().slice(0, 24) || "12:00 UTC"),
      z.string().min(1).max(24),
    ),
    scheduledDay: z.preprocess(blankToNull, dayStr.nullish()),
    durationMin: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
      z.number().int().min(1).max(1440).nullish(),
    ),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    status: z.enum(["pending", "in_progress", "done"]).default("pending"),
  })
  .strict();

export const plannerMissionPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(140).optional(),
    description: z.preprocess(blankToNull, z.string().max(500).nullish()),
    category: z.enum(["Vital Check", "Exercise", "Nutrition", "EVA Prep", "Rest"]).optional(),
    timeUtc: z.preprocess(
      (v) => (v === null ? undefined : v === undefined ? undefined : String(v).trim().slice(0, 24)),
      z.string().min(1).max(24).optional(),
    ),
    scheduledDay: z.preprocess(blankToNull, dayStr.nullish()),
    durationMin: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
      z.number().int().min(1).max(1440).optional(),
    ),
    priority: z.enum(["low", "medium", "high"]).optional(),
    status: z.enum(["pending", "in_progress", "done"]).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

/** User-managed Activity & Exercise log rows (migration 008). */
export const workoutSchema = z
  .object({
    name: z.string().trim().min(1).max(140),
    focus: z.enum(["Resistance", "Cardio", "Mobility", "Core"]).default("Resistance"),
    durationMin: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? Number.NaN : Number(v)),
      z.number().int().min(1).max(600),
    ),
    sessionDay: z.preprocess(blankToNull, dayStr.nullish()),
    notes: z.preprocess(blankToNull, z.string().max(500).nullish()),
    completed: z.boolean().default(false),
  })
  .strict();

export const workoutPatchSchema = z
  .object({
    name: z.string().trim().min(1).max(140).optional(),
    focus: z.enum(["Resistance", "Cardio", "Mobility", "Core"]).optional(),
    durationMin: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
      z.number().int().min(1).max(600).optional(),
    ),
    sessionDay: z.preprocess(blankToNull, dayStr.nullish()),
    notes: z.preprocess(blankToNull, z.string().max(500).nullish()),
    completed: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });
