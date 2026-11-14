/**
 * Demo Respiratory Monitoring (RR) dataset & computation helpers.
 * Structured cleanly so live respiratory sensor telemetry can replace these values later.
 */

export interface RespiratoryTrendPoint {
  time: string;
  rr: number;
}

export const RESPIRATORY_MAJOR_TICKS = ["00:00", "06:00", "12:00", "18:00", "24:00"];

export const RESPIRATORY_NORMAL_RANGE = { min: 12, max: 20 } as const;

export const INITIAL_RESPIRATORY_RATE = 16;

export const RESPIRATORY_24H_SERIES: readonly RespiratoryTrendPoint[] = [
  { time: "00:00", rr: 15 },
  { time: "01:00", rr: 15 },
  { time: "02:00", rr: 16 },
  { time: "03:00", rr: 15 },
  { time: "04:00", rr: 14 },
  { time: "05:00", rr: 15 },
  { time: "06:00", rr: 16 },
  { time: "07:00", rr: 17 },
  { time: "08:00", rr: 16 },
  { time: "09:00", rr: 14 },
  { time: "10:00", rr: 16 },
  { time: "11:00", rr: 19 },
  { time: "12:00", rr: 22 },
  { time: "13:00", rr: 18 },
  { time: "14:00", rr: 15 },
  { time: "15:00", rr: 14 },
  { time: "16:00", rr: 15 },
  { time: "17:00", rr: 15 },
  { time: "18:00", rr: 16 },
  { time: "19:00", rr: 14 },
  { time: "20:00", rr: 13 },
  { time: "21:00", rr: 12 },
  { time: "22:00", rr: 13 },
  { time: "23:00", rr: 12 },
  { time: "24:00", rr: 14 },
];

export interface RespiratorySummaryStats {
  average: number;
  max: number;
  min: number;
}

export function computeRespiratoryStats(
  series: readonly RespiratoryTrendPoint[],
): RespiratorySummaryStats {
  if (series.length === 0) {
    return { average: 0, max: 0, min: 0 };
  }
  let sum = 0;
  let max = -Infinity;
  let min = Infinity;
  for (const pt of series) {
    sum += pt.rr;
    if (pt.rr > max) max = pt.rr;
    if (pt.rr < min) min = pt.rr;
  }
  return {
    average: Math.round(sum / series.length),
    max,
    min,
  };
}

export type RespiratoryStatusTone = "normal" | "amber" | "critical";

export function evaluateRespiratoryStatus(
  rr: number,
  range = RESPIRATORY_NORMAL_RANGE,
): RespiratoryStatusTone {
  if (rr >= range.min && rr <= range.max) return "normal";
  if ((rr >= range.min - 2 && rr < range.min) || (rr > range.max && rr <= range.max + 4)) {
    return "amber";
  }
  return "critical";
}

/** Generates a small simulated variation in 14–18 br/min with a non-zero delta. */
export function nextSimulatedRespiratoryRate(prev: number): number {
  const step = Math.random() < 0.5 ? -1 : 1;
  const candidate = prev + step;
  if (candidate < 14) return prev + 1;
  if (candidate > 18) return prev - 1;
  return candidate;
}
