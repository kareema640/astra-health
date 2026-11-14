/**
 * Mock 30-day astronaut sleep dataset & metric helpers.
 * Structured so real sleep tracker / wearable telemetry can replace these values later.
 */

export type SleepRange = "7D" | "30D" | "Custom";

export interface SleepDayRecord {
  isoDate: string;
  weekday: string;
  shortDate: string;
  fullDate: string;
  hours: number;
  totalMinutes: number;
  efficiency: number;
  score: number;
  deepMinutes: number;
}

export const SLEEP_30D_RECORDS: readonly SleepDayRecord[] = [
  {
    isoDate: "2026-10-18",
    weekday: "Sun",
    shortDate: "Oct 18",
    fullDate: "Sun, Oct 18, 2026",
    hours: 7.6,
    totalMinutes: 456,
    efficiency: 91,
    score: 84,
    deepMinutes: 105,
  },
  {
    isoDate: "2026-10-19",
    weekday: "Mon",
    shortDate: "Oct 19",
    fullDate: "Mon, Oct 19, 2026",
    hours: 7.4,
    totalMinutes: 444,
    efficiency: 90,
    score: 82,
    deepMinutes: 100,
  },
  {
    isoDate: "2026-10-20",
    weekday: "Tue",
    shortDate: "Oct 20",
    fullDate: "Tue, Oct 20, 2026",
    hours: 7.9,
    totalMinutes: 474,
    efficiency: 92,
    score: 86,
    deepMinutes: 112,
  },
  {
    isoDate: "2026-10-21",
    weekday: "Wed",
    shortDate: "Oct 21",
    fullDate: "Wed, Oct 21, 2026",
    hours: 8.1,
    totalMinutes: 486,
    efficiency: 93,
    score: 87,
    deepMinutes: 116,
  },
  {
    isoDate: "2026-10-22",
    weekday: "Thu",
    shortDate: "Oct 22",
    fullDate: "Thu, Oct 22, 2026",
    hours: 7.5,
    totalMinutes: 450,
    efficiency: 91,
    score: 83,
    deepMinutes: 104,
  },
  {
    isoDate: "2026-10-23",
    weekday: "Fri",
    shortDate: "Oct 23",
    fullDate: "Fri, Oct 23, 2026",
    hours: 8.4,
    totalMinutes: 504,
    efficiency: 94,
    score: 90,
    deepMinutes: 122,
  },
  {
    isoDate: "2026-10-24",
    weekday: "Sat",
    shortDate: "Oct 24",
    fullDate: "Sat, Oct 24, 2026",
    hours: 6.4,
    totalMinutes: 384,
    efficiency: 81,
    score: 68,
    deepMinutes: 76,
  },
  {
    isoDate: "2026-10-25",
    weekday: "Sun",
    shortDate: "Oct 25",
    fullDate: "Sun, Oct 25, 2026",
    hours: 5.5,
    totalMinutes: 330,
    efficiency: 74,
    score: 56,
    deepMinutes: 60,
  },
  {
    isoDate: "2026-10-26",
    weekday: "Mon",
    shortDate: "Oct 26",
    fullDate: "Mon, Oct 26, 2026",
    hours: 6.8,
    totalMinutes: 408,
    efficiency: 84,
    score: 72,
    deepMinutes: 86,
  },
  {
    isoDate: "2026-10-27",
    weekday: "Tue",
    shortDate: "Oct 27",
    fullDate: "Tue, Oct 27, 2026",
    hours: 7.2,
    totalMinutes: 432,
    efficiency: 88,
    score: 78,
    deepMinutes: 94,
  },
  {
    isoDate: "2026-10-28",
    weekday: "Wed",
    shortDate: "Oct 28",
    fullDate: "Wed, Oct 28, 2026",
    hours: 7.8,
    totalMinutes: 468,
    efficiency: 92,
    score: 85,
    deepMinutes: 110,
  },
  {
    isoDate: "2026-10-29",
    weekday: "Thu",
    shortDate: "Oct 29",
    fullDate: "Thu, Oct 29, 2026",
    hours: 8.3,
    totalMinutes: 498,
    efficiency: 94,
    score: 89,
    deepMinutes: 120,
  },
  {
    isoDate: "2026-10-30",
    weekday: "Fri",
    shortDate: "Oct 30",
    fullDate: "Fri, Oct 30, 2026",
    hours: 8.0,
    totalMinutes: 480,
    efficiency: 92,
    score: 86,
    deepMinutes: 114,
  },
  {
    isoDate: "2026-10-31",
    weekday: "Sat",
    shortDate: "Oct 31",
    fullDate: "Sat, Oct 31, 2026",
    hours: 8.6,
    totalMinutes: 516,
    efficiency: 95,
    score: 91,
    deepMinutes: 126,
  },
  {
    isoDate: "2026-11-01",
    weekday: "Sun",
    shortDate: "Nov 1",
    fullDate: "Sun, Nov 1, 2026",
    hours: 8.1,
    totalMinutes: 486,
    efficiency: 93,
    score: 87,
    deepMinutes: 116,
  },
  {
    isoDate: "2026-11-02",
    weekday: "Mon",
    shortDate: "Nov 2",
    fullDate: "Mon, Nov 2, 2026",
    hours: 7.5,
    totalMinutes: 450,
    efficiency: 91,
    score: 83,
    deepMinutes: 106,
  },
  {
    isoDate: "2026-11-03",
    weekday: "Tue",
    shortDate: "Nov 3",
    fullDate: "Tue, Nov 3, 2026",
    hours: 7.9,
    totalMinutes: 474,
    efficiency: 93,
    score: 86,
    deepMinutes: 114,
  },
  {
    isoDate: "2026-11-04",
    weekday: "Wed",
    shortDate: "Nov 4",
    fullDate: "Wed, Nov 4, 2026",
    hours: 7.4,
    totalMinutes: 444,
    efficiency: 90,
    score: 82,
    deepMinutes: 102,
  },
  {
    isoDate: "2026-11-05",
    weekday: "Thu",
    shortDate: "Nov 5",
    fullDate: "Thu, Nov 5, 2026",
    hours: 8.5,
    totalMinutes: 510,
    efficiency: 94,
    score: 90,
    deepMinutes: 124,
  },
  {
    isoDate: "2026-11-06",
    weekday: "Fri",
    shortDate: "Nov 6",
    fullDate: "Fri, Nov 6, 2026",
    hours: 8.2,
    totalMinutes: 492,
    efficiency: 93,
    score: 88,
    deepMinutes: 118,
  },
  {
    isoDate: "2026-11-07",
    weekday: "Sat",
    shortDate: "Nov 7",
    fullDate: "Sat, Nov 7, 2026",
    hours: 8.7,
    totalMinutes: 522,
    efficiency: 95,
    score: 91,
    deepMinutes: 128,
  },
  {
    isoDate: "2026-11-08",
    weekday: "Sun",
    shortDate: "Nov 8",
    fullDate: "Sun, Nov 8, 2026",
    hours: 8.0,
    totalMinutes: 480,
    efficiency: 92,
    score: 86,
    deepMinutes: 114,
  },
  {
    isoDate: "2026-11-09",
    weekday: "Mon",
    shortDate: "Nov 9",
    fullDate: "Mon, Nov 9, 2026",
    hours: 7.7,
    totalMinutes: 462,
    efficiency: 91,
    score: 85,
    deepMinutes: 109,
  },
  // Last 7 days (Nov 10 – Nov 16) matching the 7D chart curve
  {
    isoDate: "2026-11-10",
    weekday: "Mon",
    shortDate: "Nov 10",
    fullDate: "Mon, Nov 10, 2026",
    hours: 7.8,
    totalMinutes: 468,
    efficiency: 94,
    score: 88,
    deepMinutes: 112,
  },
  {
    isoDate: "2026-11-11",
    weekday: "Tue",
    shortDate: "Nov 11",
    fullDate: "Tue, Nov 11, 2026",
    hours: 8.6,
    totalMinutes: 516,
    efficiency: 95,
    score: 90,
    deepMinutes: 125,
  },
  {
    isoDate: "2026-11-12",
    weekday: "Wed",
    shortDate: "Nov 12",
    fullDate: "Wed, Nov 12, 2026",
    hours: 7.8,
    totalMinutes: 468,
    efficiency: 92,
    score: 85,
    deepMinutes: 108,
  },
  {
    isoDate: "2026-11-13",
    weekday: "Thu",
    shortDate: "Nov 13",
    fullDate: "Thu, Nov 13, 2026",
    hours: 9.1,
    totalMinutes: 546,
    efficiency: 96,
    score: 94,
    deepMinutes: 136,
  },
  {
    isoDate: "2026-11-14",
    weekday: "Fri",
    shortDate: "Nov 14",
    fullDate: "Fri, Nov 14, 2026",
    hours: 8.8,
    totalMinutes: 528,
    efficiency: 95,
    score: 91,
    deepMinutes: 128,
  },
  {
    isoDate: "2026-11-15",
    weekday: "Sat",
    shortDate: "Nov 15",
    fullDate: "Sat, Nov 15, 2026",
    hours: 8.5,
    totalMinutes: 510,
    efficiency: 94,
    score: 89,
    deepMinutes: 122,
  },
  {
    isoDate: "2026-11-16",
    weekday: "Sun",
    shortDate: "Nov 16",
    fullDate: "Sun, Nov 16, 2026",
    hours: 8.2,
    totalMinutes: 492,
    efficiency: 93,
    score: 87,
    deepMinutes: 118,
  },
];

export const SLEEP_MIN_DATE = SLEEP_30D_RECORDS[0]?.isoDate ?? "2026-10-18";
export const SLEEP_MAX_DATE =
  SLEEP_30D_RECORDS[SLEEP_30D_RECORDS.length - 1]?.isoDate ?? "2026-11-16";

export function formatSleepMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}h ${m}m`;
}

export function filterSleepRecords(
  range: SleepRange,
  customFrom: string,
  customTo: string,
): readonly SleepDayRecord[] {
  if (range === "7D") return SLEEP_30D_RECORDS.slice(-7);
  if (range === "30D") return SLEEP_30D_RECORDS;
  const from = customFrom <= customTo ? customFrom : customTo;
  const to = customFrom <= customTo ? customTo : customFrom;
  const filtered = SLEEP_30D_RECORDS.filter((r) => r.isoDate >= from && r.isoDate <= to);
  return filtered.length > 0 ? filtered : SLEEP_30D_RECORDS.slice(-7);
}

export interface SleepSummaryMetrics {
  totalLabel: string;
  efficiency: number;
  score: number;
  deepLabel: string;
  deepPercent: number;
  badge: { label: "Good" | "Fair" | "Poor"; tone: "green" | "amber" | "red" };
  tip: string;
}

export function computeSleepSummary(
  records: readonly SleepDayRecord[],
  range: SleepRange,
): SleepSummaryMetrics {
  const source = records.length > 0 ? records : SLEEP_30D_RECORDS.slice(-7);
  // On the default 7D view, feature the primary tracked night (Mon Nov 10: 7h 48m, 94%, 88/100, 1h 52m).
  const targetList = range === "7D" && source[0] ? [source[0]] : source;

  const avgTotalMin = Math.round(
    targetList.reduce((acc, r) => acc + r.totalMinutes, 0) / targetList.length,
  );
  const avgEfficiency = Math.round(
    targetList.reduce((acc, r) => acc + r.efficiency, 0) / targetList.length,
  );
  const avgScore = Math.round(targetList.reduce((acc, r) => acc + r.score, 0) / targetList.length);
  const avgDeepMin = Math.round(
    targetList.reduce((acc, r) => acc + r.deepMinutes, 0) / targetList.length,
  );
  const deepPercent = avgTotalMin > 0 ? Math.round((avgDeepMin / avgTotalMin) * 100) : 0;

  const badge: SleepSummaryMetrics["badge"] =
    avgScore >= 80
      ? { label: "Good", tone: "green" }
      : avgScore >= 60
        ? { label: "Fair", tone: "amber" }
        : { label: "Poor", tone: "red" };

  const tip =
    avgScore >= 80
      ? "Your sleep is on track! Keep it up. 🌙"
      : avgScore >= 60
        ? "Decent sleep, try to keep a steady bedtime. 😴"
        : "Your sleep needs attention, try to rest earlier tonight. ⚠️";

  return {
    totalLabel: formatSleepMinutes(avgTotalMin),
    efficiency: avgEfficiency,
    score: avgScore,
    deepLabel: formatSleepMinutes(avgDeepMin),
    deepPercent,
    badge,
    tip,
  };
}
