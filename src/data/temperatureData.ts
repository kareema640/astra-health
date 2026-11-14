/**
 * Demo Body Temperature (°C) dataset & telemetry helpers.
 * Structured so real wearable temperature sensor streams can replace these values later.
 */

export interface TemperatureTrendPoint {
  time: string;
  temp: number;
}

export const TEMPERATURE_MAJOR_TICKS = ["00:00", "06:00", "12:00", "18:00", "24:00"];

export const TEMPERATURE_Y_TICKS = [35.5, 36.0, 36.5, 37.0, 37.5, 38.0];

export const TEMPERATURE_DOMAIN = { min: 35.5, max: 38.0 } as const;

export const TEMPERATURE_NORMAL_RANGE = { min: 36.1, max: 37.2 } as const;

export const INITIAL_BODY_TEMPERATURE = 36.6;

export const INITIAL_TEMPERATURE_DELTA = 0.1;

export const TEMPERATURE_24H_SERIES: readonly TemperatureTrendPoint[] = [
  { time: "00:00", temp: 36.2 },
  { time: "01:00", temp: 36.3 },
  { time: "02:00", temp: 36.4 },
  { time: "03:00", temp: 36.0 },
  { time: "04:00", temp: 35.8 },
  { time: "05:00", temp: 36.1 },
  { time: "06:00", temp: 36.2 },
  { time: "07:00", temp: 36.5 },
  { time: "08:00", temp: 36.9 },
  { time: "09:00", temp: 36.8 },
  { time: "10:00", temp: 36.5 },
  { time: "11:00", temp: 36.3 },
  { time: "12:00", temp: 36.2 },
  { time: "13:00", temp: 36.3 },
  { time: "14:00", temp: 36.5 },
  { time: "15:00", temp: 36.5 },
  { time: "16:00", temp: 36.3 },
  { time: "17:00", temp: 36.5 },
  { time: "18:00", temp: 37.0 },
  { time: "19:00", temp: 36.4 },
  { time: "20:00", temp: 36.2 },
  { time: "21:00", temp: 36.4 },
  { time: "22:00", temp: 37.1 },
  { time: "23:00", temp: 36.5 },
  { time: "24:00", temp: 36.4 },
];

export interface TemperatureSummaryStats {
  average: number;
  max: number;
  min: number;
}

export function computeTemperatureStats(
  series: readonly TemperatureTrendPoint[],
): TemperatureSummaryStats {
  if (series.length === 0) {
    return { average: 0, max: 0, min: 0 };
  }
  let sum = 0;
  let max = -Infinity;
  let min = Infinity;
  for (const pt of series) {
    sum += pt.temp;
    if (pt.temp > max) max = pt.temp;
    if (pt.temp < min) min = pt.temp;
  }
  return {
    average: Math.round((sum / series.length) * 10) / 10,
    max: Math.round(max * 10) / 10,
    min: Math.round(min * 10) / 10,
  };
}

export type TemperatureStatusTone = "normal" | "amber" | "critical";

export function evaluateTemperatureStatus(
  temp: number,
  range = TEMPERATURE_NORMAL_RANGE,
): TemperatureStatusTone {
  if (temp >= range.min && temp <= range.max) return "normal";
  if (temp > 38.0) return "critical";
  return "amber";
}

/** Progress ring fill fraction inside the 35.5°C – 38.0°C display range. */
export function temperatureRingFraction(temp: number): number {
  const span = TEMPERATURE_DOMAIN.max - TEMPERATURE_DOMAIN.min;
  const normalized = (temp - TEMPERATURE_DOMAIN.min) / span;
  return Math.min(1, Math.max(0.06, normalized));
}

/** Generates a small simulated variation within 36.4°C – 36.8°C. */
export function nextSimulatedTemperature(prev: number): number {
  const steps = [-0.1, 0, 0.1] as const;
  const pick = steps[Math.floor(Math.random() * steps.length)] ?? 0;
  const candidate = Math.round((prev + pick) * 10) / 10;
  if (candidate < 36.4) return 36.5;
  if (candidate > 36.8) return 36.7;
  return candidate;
}
