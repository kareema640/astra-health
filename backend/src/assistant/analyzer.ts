/**
 * Port of the standalone chatbot's app/analyzer.py `analyze_health`.
 * The rule set and finding wording are preserved exactly so the integrated
 * assistant behaves identically where data exists. The original crashed on
 * missing columns; here every rule simply skips (and records) when the user
 * has no measurement for it — "missing" is never treated as zero.
 */

export interface AnalyzerContext {
  heart_rate: number | null;
  spo2: number | null;
  systolic: number | null;
  diastolic: number | null;
  body_temperature: number | null;
  respiratory_rate: number | null;
  sleep_hours: number | null;
  stress: number | null;
  fatigue: number | null;
}

export interface AnalysisResult {
  astronaut_id: string;
  findings: string[];
  /** Checks that could not run because the measurement was never recorded. */
  unavailable: string[];
}

const NUM = (v: number | null): v is number =>
  v !== null && Number.isFinite(v);

export function analyzeHealth(astronautId: string, c: AnalyzerContext): AnalysisResult {
  const findings: string[] = [];
  const unavailable: string[] = [];
  const skip = (name: string) => unavailable.push(name);

  // Heart Rate
  if (NUM(c.heart_rate)) {
    if (c.heart_rate > 100) findings.push("Heart rate is elevated and needs review.");
  } else skip("heart_rate");

  // Oxygen Saturation
  if (NUM(c.spo2)) {
    if (c.spo2 < 95) findings.push("Oxygen saturation is below the selected screening threshold.");
  } else skip("spo2");

  // Blood Pressure
  if (NUM(c.systolic) || NUM(c.diastolic)) {
    if ((c.systolic ?? 0) >= 140 || (c.diastolic ?? 0) >= 90) {
      findings.push("Blood pressure is elevated and needs review.");
    }
  } else skip("blood_pressure");

  // Body Temperature
  if (NUM(c.body_temperature)) {
    if (c.body_temperature >= 38) findings.push("Body temperature is elevated.");
  } else skip("body_temperature");

  // Respiratory Rate
  if (NUM(c.respiratory_rate)) {
    if (c.respiratory_rate > 20) findings.push("Respiratory rate is elevated.");
  } else skip("respiratory_rate");

  // Sleep
  if (NUM(c.sleep_hours)) {
    if (c.sleep_hours < 6) findings.push("Sleep duration is relatively low.");
  } else skip("sleep_hours");

  // Stress
  if (NUM(c.stress)) {
    if (c.stress >= 7) findings.push("High stress score detected.");
  } else skip("stress");

  // Fatigue
  if (NUM(c.fatigue)) {
    if (c.fatigue >= 7) findings.push("High fatigue score detected.");
  } else skip("fatigue");

  if (findings.length === 0) {
    findings.push("No alert was triggered by the current demo rules.");
  }
  return { astronaut_id: astronautId, findings, unavailable };
}
