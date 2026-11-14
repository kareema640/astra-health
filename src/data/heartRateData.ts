/**
 * Demo Heart Rate Monitoring dataset & helper utilities.
 * Structured cleanly so live wearable / telemetry streams can replace these values later.
 */

export interface HeartRateStats {
  initialBpm: number;
  hrvMs: number;
  restingHrBpm: number;
  averageHrBpm: number;
  maxHrBpm: number;
  minHrBpm: number;
  healthyRange: {
    min: number;
    max: number;
  };
  normalChartBand: {
    low: number;
    high: number;
  };
}

export interface HeartRate24hPoint {
  time: string;
  bpm: number;
}

export const HEART_RATE_DEMO_STATS: HeartRateStats = {
  initialBpm: 72,
  hrvMs: 48,
  restingHrBpm: 62,
  averageHrBpm: 78,
  maxHrBpm: 118,
  minHrBpm: 54,
  healthyRange: { min: 60, max: 100 },
  normalChartBand: { low: 50, high: 85 },
};

export const HEART_RATE_24H_SERIES: readonly HeartRate24hPoint[] = [
  { time: "00:00", bpm: 60 },
  { time: "01:30", bpm: 61 },
  { time: "03:00", bpm: 66 },
  { time: "04:30", bpm: 71 },
  { time: "06:00", bpm: 72 },
  { time: "07:30", bpm: 67 },
  { time: "09:00", bpm: 63 },
  { time: "10:30", bpm: 67 },
  { time: "12:00", bpm: 72 },
  { time: "13:30", bpm: 76 },
  { time: "15:00", bpm: 79 },
  { time: "16:30", bpm: 79 },
  { time: "18:00", bpm: 77 },
  { time: "19:30", bpm: 71 },
  { time: "21:00", bpm: 65 },
  { time: "22:30", bpm: 65 },
  { time: "24:00", bpm: 68 },
];

export const HEART_RATE_MAJOR_TICKS = ["00:00", "06:00", "12:00", "18:00", "24:00"];

export type HeartRateStatusTone = "normal" | "amber" | "critical";

export function evaluateHeartRateStatus(
  bpm: number,
  range = HEART_RATE_DEMO_STATS.healthyRange,
): { label: string; tone: HeartRateStatusTone } {
  if (bpm >= range.min && bpm <= range.max) {
    return { label: "Normal", tone: "normal" };
  }
  if ((bpm >= range.min - 10 && bpm < range.min) || (bpm > range.max && bpm <= range.max + 15)) {
    return { label: "Elevated", tone: "amber" };
  }
  return { label: "Alert", tone: "critical" };
}

/** Generates a small realistic simulated variation around 68–76 BPM. */
export function nextSimulatedBpm(prev: number): number {
  const delta = Math.floor(Math.random() * 5) - 2; // -2..+2
  const candidate = prev + delta;
  if (candidate < 68) return 68 + Math.floor(Math.random() * 3);
  if (candidate > 76) return 76 - Math.floor(Math.random() * 3);
  return candidate;
}
