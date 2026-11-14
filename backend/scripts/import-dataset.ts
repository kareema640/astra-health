/**
 * Imports the SIMULATED workbook (astra_health_unified_dataset_480rows.csv —
 * actually 14,400 rows × 58 cols) into the partitioned telemetry schema with
 * full provenance (source='simulated', is_synthetic=true, source_template
 * kept). Never mixes into personal data.
 *
 * Usage:  bun scripts/import-dataset.ts <csv-path>
 * Idempotent: every insert is ON CONFLICT DO NOTHING/(re)set; re-running is
 * safe. Values are rounded to each column's declared scale (the sheet carries
 * full float precision; smallint columns are rounded to integers).
 *
 * Grain splitting (per the approved analysis §1.2):
 *  - 3-hourly columns → vital_observations / ecg_measurements /
 *    activity_observations; cabin columns → environment_observations
 *    (station-scoped: one row per (mission, ts) — analysis §6-9).
 *  - constant-per-day columns → sleep / muscle / neuro summaries keyed
 *    (astronaut, day); the three free-text event columns → mission_events.
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { runMigrations } from "../src/db/migrate";

// ---- tiny CSV parser (the file has no quoted commas) ----
function readCsv(file: string): { header: string[]; rows: string[][] } {
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const header = lines[0]!.split(",");
  return { header, rows: lines.slice(1).map((l) => l.split(",")) };
}

/** Parse with scale; ""/bad → null (missing values must never become 0). */
function r(v: string | undefined, scale: number | null): number | null {
  if (v === undefined || v.trim() === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (scale === null) return Math.round(n); // integer columns
  const f = 10 ** scale;
  return Math.round(n * f) / f;
}
const txt = (v: string | undefined): string | null => {
  const s = (v ?? "").trim();
  return s === "" ? null : s;
};

export async function importDataset(
  csvFile: string,
  connectionString: string,
  log: (m: string) => void = console.log,
): Promise<void> {
  const applied = await runMigrations(connectionString);
  if (applied.length) log(`migrations applied: ${applied.join(", ")}`);

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const { header, rows } = readCsv(path.resolve(csvFile));
    const idx = Object.fromEntries(header.map((h, i) => [h, i])) as Record<string, number>;
    const get = (row: string[], col: string): string | undefined => row[idx[col]!];
    const tsOf = (row: string[]): string =>
      new Date((get(row, "timestamp_utc") ?? "").replace(" ", "T")).toISOString();

    // ---- mission registry, dates derived from the sheet ----
    const days = rows.map((x) => r(get(x, "mission_day"), null) ?? 1);
    const dayMin = Math.min(...days);
    const dayMax = Math.max(...days);
    const startTs = tsOf(rows.reduce((a, b) => (tsOf(a) <= tsOf(b) ? a : b)));
    const start = new Date(startTs);
    start.setUTCHours(0, 0, 0, 0);
    const startDate = start.toISOString().slice(0, 10);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + (dayMax - dayMin));
    const missionRes = await client.query(
      `INSERT INTO missions (code, name, start_date, end_date, status, notes)
       VALUES ('ASTRA-SIM-2026', 'ASTRA Simulated Expedition 2026', $1, $2, 'completed',
               'Synthetic physiology dataset imported from the project data reference workbook')
       ON CONFLICT (code) DO UPDATE SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date
       RETURNING id`,
      [startDate, end.toISOString().slice(0, 10)],
    );
    const missionId = missionRes.rows[0].id as string;

    const phases = new Map<string, [number, number]>();
    for (const row of rows) {
      const name = txt(get(row, "mission_phase"));
      const day = r(get(row, "mission_day"), null);
      if (!name || day === null) continue;
      const cur = phases.get(name) ?? [day, day];
      phases.set(name, [Math.min(cur[0], day), Math.max(cur[1], day)]);
    }
    for (const [name, [from, to]] of phases) {
      await client.query(
        `INSERT INTO mission_phases (mission_id, name, day_from, day_to)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (mission_id, name) DO UPDATE SET day_from = EXCLUDED.day_from, day_to = EXCLUDED.day_to`,
        [missionId, name, from, to],
      );
    }

    // ---- simulated astronaut identities ----
    const designators = [...new Set(rows.map((x) => txt(get(x, "astronaut_id"))!))].sort();
    for (const d of designators) {
      await client.query(
        `INSERT INTO astronauts (designator, display_name, mission_id, kind)
         VALUES ($1, $1, $2, 'simulated')
         ON CONFLICT (designator) DO UPDATE SET mission_id = EXCLUDED.mission_id`,
        [d, missionId],
      );
    }
    const found = await client.query(
      "SELECT id, designator FROM astronauts WHERE designator = ANY($1)",
      [designators],
    );
    const aidOf = Object.fromEntries(found.rows.map((a) => [a.designator, a.id])) as Record<string, string>;

    const ins = async (sql: string, params: unknown[]) =>
      (await client.query(sql, params)).rowCount ?? 0;
    let vit = 0;
    let ecg = 0;
    let act = 0;
    let env = 0;
    let slp = 0;
    let mus = 0;
    let neu = 0;
    let evt = 0;
    let ill = 0;
    const envSeen = new Set<string>();

    for (const row of rows) {
      const aid = aidOf[txt(get(row, "astronaut_id"))!];
      const ts = tsOf(row);
      const day = ts.slice(0, 10);

      vit += await ins(
        `INSERT INTO vital_observations
           (astronaut_id, ts, source, heart_rate_bpm, hrv_rmssd_ms,
            avg_heart_rate_bpm, max_heart_rate_bpm, min_heart_rate_bpm,
            systolic_bp_mmhg, diastolic_bp_mmhg, respiratory_rate_brmin,
            spo2_pct, respiratory_variability_rmssd_s, respiratory_pattern,
            body_temperature_c, temperature_trend, source_template, is_synthetic)
         VALUES ($1,$2,'simulated',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true)
         ON CONFLICT (astronaut_id, ts, source) DO NOTHING`,
        [aid, ts,
         r(get(row, "heart_rate_bpm"), 1), r(get(row, "hrv_rmssd_ms"), 1),
         r(get(row, "average_heart_rate_bpm"), 1), r(get(row, "max_heart_rate_bpm"), 1),
         r(get(row, "min_heart_rate_bpm"), 1), r(get(row, "systolic_bp_mmhg"), null),
         r(get(row, "diastolic_bp_mmhg"), null), r(get(row, "respiratory_rate_bpm"), 1),
         r(get(row, "spo2_pct"), 1), r(get(row, "respiratory_variability_rmssd_s"), 2),
         txt(get(row, "respiratory_pattern")), r(get(row, "body_temperature_c"), 1),
         txt(get(row, "temperature_trend")), txt(get(row, "source_template"))],
      );
      ecg += await ins(
        `INSERT INTO ecg_measurements
           (astronaut_id, ts, source, pr_interval_ms, qrs_duration_ms,
            qt_interval_ms, qtc_interval_ms, is_synthetic)
         VALUES ($1,$2,'simulated',$3,$4,$5,$6,true)
         ON CONFLICT (astronaut_id, ts, source) DO NOTHING`,
        [aid, ts,
         r(get(row, "ecg_pr_interval_ms"), null), r(get(row, "ecg_qrs_duration_ms"), null),
         r(get(row, "ecg_qt_interval_ms"), 1), r(get(row, "ecg_qtc_interval_ms"), 1)],
      );
      act += await ins(
        `INSERT INTO activity_observations
           (astronaut_id, ts, source, activity_type, steps_movement_equivalent,
            active_minutes, activity_intensity, exercise_sessions_count, is_synthetic)
         VALUES ($1,$2,'simulated',$3,$4,$5,$6,$7,true)
         ON CONFLICT (astronaut_id, ts, source) DO NOTHING`,
        [aid, ts,
         txt(get(row, "activity_type")), r(get(row, "steps_movement_equivalent"), null),
         r(get(row, "active_minutes"), 1), txt(get(row, "activity_intensity")),
         r(get(row, "exercise_sessions_count"), null)],
      );
      if (!envSeen.has(ts)) {
        envSeen.add(ts);
        env += await ins(
          `INSERT INTO environment_observations
             (mission_id, ts, source, co2_ppm, cabin_temp_c, humidity_pct, pressure_kpa, is_synthetic)
           VALUES ($1,$2,'simulated',$3,$4,$5,$6,true)
           ON CONFLICT (mission_id, ts, source) DO NOTHING`,
          [missionId, ts,
           r(get(row, "cabin_co2_ppm"), 1), r(get(row, "cabin_temperature_c"), 1),
           r(get(row, "relative_humidity_pct"), 1), r(get(row, "cabin_pressure_kpa"), 2)],
        );
      }

      slp += await ins(
        `INSERT INTO sleep_summaries
           (astronaut_id, day, total_duration_hr, efficiency_pct, rem_sleep_hr,
            deep_sleep_hr, light_sleep_hr, awakenings_count, quality_score,
            source, is_synthetic)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'simulated',true)
         ON CONFLICT (astronaut_id, day) DO NOTHING`,
        [aid, day,
         r(get(row, "total_sleep_duration_hr"), 2), r(get(row, "sleep_efficiency_pct"), 1),
         r(get(row, "rem_sleep_hr"), 2), r(get(row, "deep_sleep_hr"), 2),
         r(get(row, "light_sleep_hr"), 2), r(get(row, "awakenings_count"), null),
         r(get(row, "sleep_quality_score_0_10"), 1)],
      );
      mus += await ins(
        `INSERT INTO muscle_bone_summaries
           (astronaut_id, day, grip_strength_kg, muscle_strength_indicator_pct,
            muscle_soreness, lower_limb_function_pct, resistance_training_min,
            source, is_synthetic)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'simulated',true)
         ON CONFLICT (astronaut_id, day) DO NOTHING`,
        [aid, day,
         r(get(row, "grip_strength_kg"), 1), r(get(row, "muscle_strength_indicator_pct"), 1),
         r(get(row, "muscle_soreness_0_10"), 1), r(get(row, "lower_limb_function_pct"), 1),
         r(get(row, "resistance_training_duration_min"), 1)],
      );
      neu += await ins(
        `INSERT INTO neuro_behavioral_summaries
           (astronaut_id, day, mood_score, stress_score, fatigue_score,
            reaction_time_ms, attention_accuracy_pct, social_connection,
            workload_level, source, is_synthetic)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'simulated',true)
         ON CONFLICT (astronaut_id, day) DO NOTHING`,
        [aid, day,
         r(get(row, "mood_score_0_10"), 1), r(get(row, "stress_score_0_10"), 1),
         r(get(row, "fatigue_score_0_10"), 1), r(get(row, "reaction_time_ms"), null),
         r(get(row, "attention_test_accuracy_pct"), 1), r(get(row, "social_connection_score_1_5"), 1),
         txt(get(row, "workload_level"))],
      );

      for (const [kind, col] of [
        ["exercise", "exercise_events"],
        ["sleep_schedule", "sleep_schedule_changes"],
        ["environmental", "environmental_events"],
      ] as const) {
        const label = txt(get(row, col));
        if (!label) continue;
        evt += await ins(
          `INSERT INTO mission_events (astronaut_id, day, kind, label, is_synthetic)
           VALUES ($1,$2,$3,$4,true) ON CONFLICT (astronaut_id, day, kind, label) DO NOTHING`,
          [aid, day, kind, label],
        );
      }

      // Illness episodes: one row per (astronaut, episode_start_day) seen with
      // simulated_illness=1; severity_max = max observed within its window.
      if (r(get(row, "simulated_illness"), null) === 1) {
        const startDay = r(get(row, "episode_start_day"), null) ?? 0;
        if (startDay > 0) {
          ill += await ins(
            `INSERT INTO illness_episodes (astronaut_id, start_day, severity_max, flag)
             VALUES ($1,$2,$3,true)
             ON CONFLICT (astronaut_id, start_day)
             DO UPDATE SET severity_max = GREATEST(
               COALESCE(illness_episodes.severity_max, 0), COALESCE(EXCLUDED.severity_max, 0))`,
            [aid, startDay, r(get(row, "severity"), 3)],
          );
        }
      }
    }

    log(
      `imported: vitals=${vit} ecg=${ecg} activity=${act} environment=${env} ` +
        `sleep=${slp} muscle=${mus} neuro=${neu} events=${evt} episodes=${ill} ` +
        `astronauts=${designators.length} mission=${startDate}→${end.toISOString().slice(0, 10)}`,
    );
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  const csv = process.argv[2] ?? "/home/ubuntu/upload/astra_health_unified_dataset_480rows.csv";
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set (run with backend/.env present)");
    process.exit(1);
  }
  void importDataset(csv, url).catch((err) => {
    console.error("import failed:", err);
    process.exit(1);
  });
}
