import { z } from "zod";

/**
 * Schemas for health modules. UI fields arrive as strings ("" = not answered);
 * every schema coerces "" to null so missing answers can never become 0.
 * Vocabularies mirror the existing frontend forms and the data reference.
 */

const optText = (max = 200) =>
  z
    .preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().max(max).nullish());

const optNum = (min: number, max: number) =>
  z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
      z.number().nullish(),
    )
    .refine((n) => n == null || (Number.isFinite(n) && n >= min && n <= max), {
      message: `Must be between ${min} and ${max}`,
    })
    .nullish();

const dateStr = z
  .preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().nullish())
  .refine((v) => v == null || /^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isNaN(Date.parse(v)), {
    message: "Invalid date",
  });

const tsStr = z
  .preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().nullish())
  .refine((v) => v == null || !Number.isNaN(Date.parse(String(v))), { message: "Invalid timestamp" });

// ---- Onboarding sync (shape of OnboardingData in the frontend store) ----
export const syncSchema = z.object({
  account: z
    .object({
      fullName: optText(80),
      email: optText(254),
      astronautId: optText(32),
      joinDate: optText(32),
    })
    .partial()
    .nullish(),
  basic: z
    .object({
      age: optNum(0, 130),
      sex: z.enum(["male", "female", "other"]).nullish(),
      height: optText(16),
      heightUnit: z.enum(["cm", "ftin"]).nullish(),
      weight: optText(16),
      weightUnit: z.enum(["kg", "lb"]).nullish(),
    })
    .partial()
    .nullish(),
  vitals: z
    .object({
      systolic: optNum(60, 260),
      diastolic: optNum(30, 160),
      bpUnknown: z.boolean().nullish(),
      respiratoryRate: optNum(4, 60),
      spo2: optNum(50, 100),
      measuredWithDevice: z.boolean().nullish(),
    })
    .partial()
    .nullish(),
  heart: z
    .object({
      heartAlert: z.enum(["off", "on"]).nullish(),
      restingHr: optNum(20, 250),
      conditions: z.array(z.enum(["none", "arrhythmia", "hypertension", "other"])).max(4).nullish(),
      alertAbove: optNum(40, 250),
      alertBelow: optNum(20, 200),
      sleep: z.enum(["lt5", "5-6", "7-8", "9plus"]).nullish(),
      hydration: z.enum(["lt1", "1-2", "2-3", "3plus"]).nullish(),
    })
    .partial()
    .nullish(),
  muscle: z
    .object({
      muscleMass: optNum(1, 200),
      boneDensity: z.enum(["normal", "osteopenia", "osteoporosis", "unknown"]).nullish(),
      emgFile: optText(255),
      dexaFile: optText(255),
      emgGroup: z.enum(["biceps", "quadriceps", "calf", "core", "forearm"]).nullish(),
    })
    .partial()
    .nullish(),
  avatar: z
    .object({
      character: z.enum(["explorer", "pilot", "scientist", "commander", "medic"]).nullish(),
      skin: z.enum(["purple", "green", "blue", "yellow", "teal"]).nullish(),
      accent: z.enum(["red", "blue", "gold", "green", "white"]).nullish(),
      callsign: optText(24),
      fromPhoto: z.boolean().nullish(),
      suit: z.enum(["eva-white", "launch-orange", "flight-blue", "lunar-gray"]).nullish(),
      visor: z.enum(["clear", "gold", "tinted"]).nullish(),
      // customPhoto (a base64 data-URL) is intentionally NOT accepted here —
      // image bytes are handled by the storage stage, not the profile row.
    })
    .partial()
    .nullish(),
  progress: z
    .record(z.enum(["basic", "vitals", "heart", "muscle", "avatar"]), z.enum(["done", "skipped"]))
    .nullish(),
});
export type SyncInput = z.infer<typeof syncSchema>;

// ---- Manual vital entry (what the health forms can legitimately record) ----
export const observationSchema = z.object({
  measuredAt: tsStr,
  heartRate: optNum(20, 250),
  hrvRmssd: optNum(0, 300),
  systolic: optNum(60, 260),
  diastolic: optNum(30, 160),
  spo2: optNum(50, 100),
  respiratoryRate: optNum(4, 60),
  temperatureC: optNum(30, 43),
  deviceLabel: optText(80),
});
export type ObservationInput = z.infer<typeof observationSchema>;

// ---- Daily summaries (sleep / muscle & bone / neuro-behavioral) ----
export const sleepSchema = z.object({
  day: dateStr.refine((d): d is string => !!d, { message: "Day is required" }),
  totalDurationHr: optNum(0, 24),
  efficiencyPct: optNum(0, 100),
  remHr: optNum(0, 24),
  deepHr: optNum(0, 24),
  lightHr: optNum(0, 24),
  awakenings: optNum(0, 200),
  qualityScore: optNum(0, 10),
});

export const muscleSummarySchema = z.object({
  day: dateStr.refine((d): d is string => !!d, { message: "Day is required" }),
  gripStrengthKg: optNum(0, 150),
  muscleStrengthPct: optNum(0, 100),
  soreness: optNum(0, 10),
  lowerLimbFunctionPct: optNum(0, 100),
  resistanceTrainingMin: optNum(0, 600),
});

export const neuroSchema = z.object({
  day: dateStr.refine((d): d is string => !!d, { message: "Day is required" }),
  mood: optNum(0, 10),
  stress: optNum(0, 10),
  fatigue: optNum(0, 10),
  reactionTimeMs: optNum(50, 5000),
  attentionPct: optNum(0, 100),
  socialConnection: optNum(1, 5),
  workload: z.enum(["Moderate", "Moderate-High", "High"]).nullish(),
});

export const alertsSchema = z.object({
  enabled: z.boolean().nullish(),
  hrAbove: optNum(40, 250),
  hrBelow: optNum(20, 200),
  spo2Below: optNum(50, 100),
  tempAbove: optNum(30, 43),
});

export const documentSchema = z.object({
  kind: z.enum(["emg_report", "dexa_report", "avatar_photo", "other"]),
  filename: z.string().trim().min(1).max(255),
  mime: optText(100),
  bytes: optNum(0, 5_000_000_000),
  sha256: optText(64),
});

export const rangeSchema = z.object({
  from: tsStr,
  to: tsStr,
  limit: z.coerce.number().int().min(1).max(1000).default(200),
});
