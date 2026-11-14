/** Unit conversions and selection rules used by the health-profile forms. */

export type HeightUnit = "cm" | "ftin";
export type WeightUnit = "kg" | "lb";

const CM_PER_INCH = 2.54;
const LB_PER_KG = 2.20462;

/** Keep digits and a single decimal point. */
export function numericOnly(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("")}` : whole;
}

/** Keep the characters used to type feet and inches, e.g. 5'9". */
export function feetInchesOnly(value: string) {
  return value.replace(/[^\d.'"\s]/g, "");
}

export function cmToFeetInches(cm: string) {
  const n = parseFloat(cm);
  if (!Number.isFinite(n) || n <= 0) return "";
  const totalInches = n / CM_PER_INCH;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return `${feet}'${inches}"`;
}

export function feetInchesToCm(value: string) {
  const match = value.match(/^\s*(\d+(?:\.\d+)?)\s*(?:'|ft)?\s*(\d+(?:\.\d+)?)?/);
  if (!match) return "";
  const feet = parseFloat(match[1] ?? "0");
  const inches = match[2] ? parseFloat(match[2]) : 0;
  const cm = Math.round((feet * 12 + inches) * CM_PER_INCH);
  return cm > 0 ? String(cm) : "";
}

export function convertHeight(value: string, from: HeightUnit, to: HeightUnit) {
  if (from === to || !value.trim()) return value;
  return to === "ftin" ? cmToFeetInches(value) : feetInchesToCm(value);
}

export function convertWeight(value: string, from: WeightUnit, to: WeightUnit) {
  if (from === to || !value.trim()) return value;
  const n = parseFloat(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(Math.round(to === "lb" ? n * LB_PER_KG : n / LB_PER_KG));
}

export type HeartCondition = "none" | "arrhythmia" | "hypertension" | "other";

/** "None" excludes every other condition; clearing the last condition falls back to "None". */
export function toggleHeartCondition(
  current: HeartCondition[],
  picked: HeartCondition,
): HeartCondition[] {
  if (picked === "none") return ["none"];
  const others = current.filter((c) => c !== "none" && c !== picked);
  const next = current.includes(picked) ? others : [...others, picked];
  return next.length ? next : ["none"];
}
