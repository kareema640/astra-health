/**
 * Organized Oxygen Monitoring (SpO2) data model and demo dataset.
 * Demo values reproduce the reference view until a wearable pulse oximeter is connected.
 */

export interface OxygenTrendPoint {
  time: string;
  spo2: number;
  isMajorTick?: boolean;
}

export interface OxygenTelemetrySnapshot {
  isDemo: boolean;
  spo2Current: number;
  spo2Status: "Normal" | "Low" | "Critical";
  pulseRateBpm: number;
  spo2Average: number;
  spo2Max: number;
  spo2Min: number;
  trend24h: readonly OxygenTrendPoint[];
}

export const OXYGEN_DEMO_SNAPSHOT: OxygenTelemetrySnapshot = {
  isDemo: true,
  spo2Current: 98,
  spo2Status: "Normal",
  pulseRateBpm: 72,
  spo2Average: 97,
  spo2Max: 100,
  spo2Min: 95,
  trend24h: [
    { time: "00:00", spo2: 97, isMajorTick: true },
    { time: "02:00", spo2: 96 },
    { time: "04:00", spo2: 96 },
    { time: "06:00", spo2: 97, isMajorTick: true },
    { time: "08:00", spo2: 98 },
    { time: "10:00", spo2: 99 },
    { time: "12:00", spo2: 98, isMajorTick: true },
    { time: "14:00", spo2: 99 },
    { time: "16:00", spo2: 100 },
    { time: "18:00", spo2: 98, isMajorTick: true },
    { time: "20:00", spo2: 97 },
    { time: "22:00", spo2: 95 },
    { time: "24:00", spo2: 98, isMajorTick: true },
  ],
};
