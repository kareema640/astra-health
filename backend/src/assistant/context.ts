import { query, queryOne } from "../db";
import { guidelineSummaryForPrompt } from "../knowledge/standards";

/**
 * Port of the standalone chatbot's app/health.py. Where the original read
 * the simulated CSV workbook, this reads the authenticated user's REAL
 * records from PostgreSQL — only rows with source ('manual','sensor') and
 * is_synthetic = false. Nothing is fabricated: every unavailable category
 * stays null and is listed in `unavailable`, so the prompt can tell Gemini
 * exactly what is measured, calculated, or missing.
 */

export interface AstraHealthContext {
  /** e.g. "AST-0114" — the user's own designator. */
  astronaut_id: string;
  /** Timestamp of the latest real measurement, if any. */
  timestamp: string | null;
  mission_day: number | null;
  heart_rate: number | null;
  hrv_rmssd_ms: number | null;
  spo2: number | null;
  blood_pressure: { systolic: number | null; diastolic: number | null } | null;
  body_temperature: number | null;
  respiratory_rate: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  stress: number | null;
  fatigue: number | null;
  mood: number | null;
  grip_strength_kg: number | null;
  reaction_time_ms: number | null;
  /** Station environment is sensor infrastructure — null until feeds exist. */
  cabin_co2: number | null;
  cabin_temperature: number | null;
  profile: {
    full_name: string | null;
    age: number | null;
    sex: string | null;
    height: string | null;
    weight: string | null;
  } | null;
  targets: {
    resting_hr: number | null;
    alert_above: number | null;
    alert_below: number | null;
    sleep_target: string | null;
    hydration: string | null;
    conditions: string[];
  } | null;
  history: {
    window_days: number;
    vital_rows: number;
    averages: {
      heart_rate: number | null;
      spo2: number | null;
      body_temperature: number | null;
      respiratory_rate: number | null;
    };
    /** The second-newest real reading, for current-vs-previous comparisons. */
    previous: {
      timestamp: string;
      heart_rate: number | null;
      spo2: number | null;
      systolic: number | null;
      diastolic: number | null;
      body_temperature: number | null;
      respiratory_rate: number | null;
    } | null;
    sleep_days_recorded: number;
    neuro_days_recorded: number;
    muscle_days_recorded: number;
    activity_minutes_24h: number | null;
    triggered_alerts_7d: number;
  };
  /** Data categories with no real rows for this user. */
  unavailable: string[];
  /**
   * Cited reference ranges (AHA/BTS/NICE/CDC/WHO/IOF/NASEM + NASA-STD-3001)
   * for the metrics this user actually has. Framing data, not measurements:
   * lets ASTRA explain values against published norms instead of inventing
   * them. Full citations live behind GET /api/knowledge/standards.
   */
  reference_standards: Record<string, string>;
  /** True when at least one real measurement exists anywhere. */
  hasData: boolean;
}

const n = (v: unknown): number | null =>
  v === null || v === undefined ? null : typeof v === "number" ? v : Number(v);

export async function buildHealthContext(
  astronautId: string,
  designator: string,
): Promise<AstraHealthContext> {
  const [
    latest,
    prev,
    avgs,
    profileRow,
    sleepRow,
    muscleRow,
    neuroRow,
    actRow,
    alertRow,
    missionRow,
    days,
  ] = await Promise.all([
    queryOne<Record<string, unknown>>(
      `SELECT ts, heart_rate_bpm, hrv_rmssd_ms, spo2_pct, systolic_bp_mmhg, diastolic_bp_mmhg,
                body_temperature_c, respiratory_rate_brmin
         FROM vital_observations
         WHERE astronaut_id = $1 AND is_synthetic = false AND source IN ('manual','sensor')
           AND COALESCE(heart_rate_bpm, spo2_pct, systolic_bp_mmhg, diastolic_bp_mmhg,
                        body_temperature_c, respiratory_rate_brmin, hrv_rmssd_ms) IS NOT NULL
         ORDER BY ts DESC LIMIT 1`,
      [astronautId],
    ),
    queryOne<Record<string, unknown>>(
      `SELECT ts, heart_rate_bpm, spo2_pct, systolic_bp_mmhg, diastolic_bp_mmhg,
                body_temperature_c, respiratory_rate_brmin
         FROM vital_observations
         WHERE astronaut_id = $1 AND is_synthetic = false AND source IN ('manual','sensor')
         ORDER BY ts DESC OFFSET 1 LIMIT 1`,
      [astronautId],
    ),
    queryOne<Record<string, unknown>>(
      `SELECT count(*)::int AS rows,
                round(avg(heart_rate_bpm)::numeric, 1) AS hr,
                round(avg(spo2_pct)::numeric, 1) AS spo2,
                round(avg(body_temperature_c)::numeric, 1) AS temp,
                round(avg(respiratory_rate_brmin)::numeric, 1) AS rr
         FROM vital_observations
         WHERE astronaut_id = $1 AND is_synthetic = false AND source IN ('manual','sensor')
           AND ts >= now() - interval '7 days'`,
      [astronautId],
    ),
    queryOne<Record<string, unknown>>(
      `SELECT p.age, p.sex, p.height, p.weight, hr.resting_hr, hr.alert_above, hr.alert_below,
                hr.sleep_target, hr.hydration, hr.conditions, u.full_name
         FROM astronaut_profiles p
         LEFT JOIN onboarding_heart_recovery hr ON hr.astronaut_id = p.astronaut_id
         LEFT JOIN astronauts a ON a.id = p.astronaut_id
         LEFT JOIN users u ON u.id = a.user_id
         WHERE p.astronaut_id = $1`,
      [astronautId],
    ),
    queryOne<Record<string, unknown>>(
      `SELECT total_duration_hr, quality_score FROM sleep_summaries
         WHERE astronaut_id = $1 AND is_synthetic = false
         ORDER BY day DESC LIMIT 1`,
      [astronautId],
    ),
    queryOne<Record<string, unknown>>(
      `SELECT grip_strength_kg FROM muscle_bone_summaries
         WHERE astronaut_id = $1 AND is_synthetic = false
         ORDER BY day DESC LIMIT 1`,
      [astronautId],
    ),
    queryOne<Record<string, unknown>>(
      `SELECT mood_score, stress_score, fatigue_score, reaction_time_ms
         FROM neuro_behavioral_summaries
         WHERE astronaut_id = $1 AND is_synthetic = false
         ORDER BY day DESC LIMIT 1`,
      [astronautId],
    ),
    queryOne<Record<string, unknown>>(
      `SELECT COALESCE(sum(active_minutes), 0)::numeric AS minutes FROM activity_observations
         WHERE astronaut_id = $1 AND is_synthetic = false AND ts >= now() - interval '1 day'`,
      [astronautId],
    ),
    queryOne<{ c: number }>(
      `SELECT count(*)::int AS c FROM alert_evaluations
         WHERE astronaut_id = $1 AND triggered = true AND evaluated_at >= now() - interval '7 days'`,
      [astronautId],
    ),
    queryOne<{ start: string; end: string } & Record<string, unknown>>(
      `SELECT m.start_date::text AS start, m.end_date::text AS end
         FROM astronauts a JOIN missions m ON m.id = a.mission_id
         WHERE a.id = $1`,
      [astronautId],
    ),
    queryOne<Record<string, number>>(
      `SELECT
           (SELECT count(*) FROM sleep_summaries       WHERE astronaut_id=$1 AND is_synthetic=false)::int AS sleep,
           (SELECT count(*) FROM neuro_behavioral_summaries WHERE astronaut_id=$1 AND is_synthetic=false)::int AS neuro,
           (SELECT count(*) FROM muscle_bone_summaries  WHERE astronaut_id=$1 AND is_synthetic=false)::int AS muscle`,
      [astronautId],
    ),
  ]);

  const unavailable: string[] = [];
  const req = (key: string, present: boolean) => {
    if (!present) unavailable.push(key);
  };

  const hr = n(latest?.["heart_rate_bpm"]);
  const spo2 = n(latest?.["spo2_pct"]);
  const sys = n(latest?.["systolic_bp_mmhg"]);
  const dia = n(latest?.["diastolic_bp_mmhg"]);
  const temp = n(latest?.["body_temperature_c"]);
  const rr = n(latest?.["respiratory_rate_brmin"]);
  const sleepHours = n(sleepRow?.["total_duration_hr"]);
  const stress = n(neuroRow?.["stress_score"]);
  const fatigue = n(neuroRow?.["fatigue_score"]);

  req("heart_rate", hr !== null);
  req("spo2", spo2 !== null);
  req("blood_pressure", sys !== null || dia !== null);
  req("body_temperature", temp !== null);
  req("respiratory_rate", rr !== null);
  req("sleep", sleepHours !== null);
  req("neuro_behavioral", stress !== null || fatigue !== null);
  req("cabin_environment", true); // station feeds are not connected for any user yet

  const missionDay = (() => {
    if (!missionRow) return null;
    const start = new Date(missionRow.start).getTime();
    const now = Date.now();
    if (Number.isNaN(start) || now < start) return null;
    const end = missionRow.end ? new Date(missionRow.end).getTime() : null;
    if (end !== null && now > end) return null;
    return Math.floor((now - start) / 86_400_000) + 1;
  })();

  const hasData =
    latest !== null ||
    sleepRow !== null ||
    neuroRow !== null ||
    muscleRow !== null ||
    profileRow !== null;

  return {
    astronaut_id: designator,
    timestamp: latest ? new Date(String(latest["ts"])).toISOString() : null,
    mission_day: missionDay,
    heart_rate: hr,
    hrv_rmssd_ms: n(latest?.["hrv_rmssd_ms"]),
    spo2,
    blood_pressure: sys === null && dia === null ? null : { systolic: sys, diastolic: dia },
    body_temperature: temp,
    respiratory_rate: rr,
    sleep_hours: sleepHours,
    sleep_quality: n(sleepRow?.["quality_score"]),
    stress,
    fatigue,
    mood: n(neuroRow?.["mood_score"]),
    grip_strength_kg: n(muscleRow?.["grip_strength_kg"]),
    reaction_time_ms: n(neuroRow?.["reaction_time_ms"]),
    cabin_co2: null,
    cabin_temperature: null,
    profile: profileRow
      ? {
          full_name: (profileRow["full_name"] as string | null) ?? null,
          age: n(profileRow["age"]),
          sex: (profileRow["sex"] as string | null) ?? null,
          height: (profileRow["height"] as string | null) ?? null,
          weight: (profileRow["weight"] as string | null) ?? null,
        }
      : null,
    targets: profileRow
      ? {
          resting_hr: n(profileRow["resting_hr"]),
          alert_above: n(profileRow["alert_above"]),
          alert_below: n(profileRow["alert_below"]),
          sleep_target: (profileRow["sleep_target"] as string | null) ?? null,
          hydration: (profileRow["hydration"] as string | null) ?? null,
          conditions: (profileRow["conditions"] as string[] | null) ?? [],
        }
      : null,
    history: {
      window_days: 7,
      vital_rows: Number(avgs?.["rows"] ?? 0),
      averages: {
        heart_rate: n(avgs?.["hr"]),
        spo2: n(avgs?.["spo2"]),
        body_temperature: n(avgs?.["temp"]),
        respiratory_rate: n(avgs?.["rr"]),
      },
      previous: prev
        ? {
            timestamp: new Date(String(prev["ts"])).toISOString(),
            heart_rate: n(prev["heart_rate_bpm"]),
            spo2: n(prev["spo2_pct"]),
            systolic: n(prev["systolic_bp_mmhg"]),
            diastolic: n(prev["diastolic_bp_mmhg"]),
            body_temperature: n(prev["body_temperature_c"]),
            respiratory_rate: n(prev["respiratory_rate_brmin"]),
          }
        : null,
      sleep_days_recorded: days?.sleep ?? 0,
      neuro_days_recorded: days?.neuro ?? 0,
      muscle_days_recorded: days?.muscle ?? 0,
      activity_minutes_24h: n(actRow?.["minutes"]),
      triggered_alerts_7d: alertRow?.c ?? 0,
    },
    unavailable,
    reference_standards: (() => {
      const all = guidelineSummaryForPrompt();
      // Only standards for data this user actually has — no unused noise.
      const present: Record<string, boolean> = {
        heart_rate: hr !== null,
        spo2: spo2 !== null,
        blood_pressure: sys !== null || dia !== null,
        body_temperature: temp !== null,
        respiratory_rate: rr !== null,
        sleep_hours: sleepHours !== null,
        activity_fitness: n(actRow?.["minutes"]) !== null,
        muscle_strength: n(muscleRow?.["grip_strength_kg"]) !== null,
        hydration: (profileRow?.["hydration"] as string | null) !== null,
        blood_glucose: false, // not collected by ASTRA today
      };
      const out: Record<string, string> = {};
      for (const [key, has] of Object.entries(present)) {
        if (has && all[key]) out[key] = all[key];
      }
      return out;
    })(),
    hasData,
  };
}

/** UI chips for the assistant bubble: only metrics that were actually measured. */
export function buildUIMetrics(
  c: AstraHealthContext,
): { emoji: string; value: string; label: string }[] {
  const f = (v: number): string => String(Number(v.toFixed(1)));
  const out: { emoji: string; value: string; label: string }[] = [];
  if (c.heart_rate !== null)
    out.push({ emoji: "❤️", value: `${f(c.heart_rate)} bpm`, label: "Heart Rate" });
  if (c.spo2 !== null) out.push({ emoji: "💧", value: `${f(c.spo2)}%`, label: "SpO₂" });
  if (c.body_temperature !== null)
    out.push({ emoji: "🌡️", value: `${f(c.body_temperature)}°C`, label: "Body Temp" });
  if (c.sleep_hours !== null)
    out.push({ emoji: "🛌", value: `${f(c.sleep_hours)} h`, label: "Sleep" });
  return out.slice(0, 4);
}
