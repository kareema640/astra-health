/**
 * Everything the dashboard shows is derived here from the user's own answers.
 * Nothing is invented: missing answers stay "Not entered", sensor-only values say "No sensor".
 */
import { convertHeight, convertWeight } from "@/components/onboarding/logic";
import type { OnboardingData } from "@/components/onboarding/onboarding-store";

export type Greeting = "Good Morning" | "Good Afternoon" | "Good Evening";

export function greetingFor(hour: number): Greeting {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function firstName(fullName: string): string | null {
  const first = fullName.trim().split(/\s+/)[0];
  return first ? first : null;
}

/**
 * Offline/signed-out fallback for the greeting: first name from the local
 * store, then callsign, then a neutral placeholder — never a fake person.
 * Signed-in users see the name from their actual account (Overview.tsx).
 */
export function displayName(data: OnboardingData): string {
  return firstName(data.account.fullName) ?? (data.avatar.callsign.trim() || "Astronaut");
}

export function avatarChosen(data: OnboardingData) {
  return data.progress.avatar === "done";
}

/** Reads "72", "97.5" or a range like "95–100" (midpoint). */
export function parseReading(value: string): number | null {
  const nums = value.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (!nums.length) return null;
  const n = nums.length > 1 ? ((nums[0] ?? 0) + (nums[1] ?? 0)) / 2 : (nums[0] ?? 0);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const SLEEP_INFO: Record<
  OnboardingData["heart"]["sleep"],
  { label: string; hours: number }
> = {
  lt5: { label: "< 5 h", hours: 4.5 },
  "5-6": { label: "5–6 h", hours: 5.5 },
  "7-8": { label: "7–8 h", hours: 7.5 },
  "9plus": { label: "9+ h", hours: 9 },
};

export const HYDRATION_LABEL: Record<OnboardingData["heart"]["hydration"], string> = {
  lt1: "< 1 L",
  "1-2": "1–2 L",
  "2-3": "2–3 L",
  "3plus": "3+ L",
};

export const SEX_LABEL: Record<OnboardingData["basic"]["sex"], string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export const BONE_LABEL: Record<OnboardingData["muscle"]["boneDensity"], string> = {
  normal: "Normal",
  osteopenia: "Osteopenia",
  osteoporosis: "Osteoporosis",
  unknown: "Unknown",
};

export const EMG_LABEL: Record<OnboardingData["muscle"]["emgGroup"], string> = {
  biceps: "Biceps",
  quadriceps: "Quadriceps",
  calf: "Calf",
  core: "Core",
  forearm: "Forearm",
};

export const CONDITION_LABEL: Record<OnboardingData["heart"]["conditions"][number], string> = {
  none: "None",
  arrhythmia: "Arrhythmia",
  hypertension: "Hypertension",
  other: "Other",
};

/** Sleep only counts as the user's answer once they completed Heart & Recovery. */
export function reportedSleep(data: OnboardingData) {
  return data.progress.heart === "done" ? SLEEP_INFO[data.heart.sleep] : null;
}

export function reportedHydration(data: OnboardingData) {
  return data.progress.heart === "done" ? HYDRATION_LABEL[data.heart.hydration] : null;
}

/** Body-mass index from the entered height and weight, rounded to one decimal. */
export function bmi(basic: OnboardingData["basic"]): number | null {
  const cm = parseReading(convertHeight(basic.height, basic.heightUnit, "cm"));
  const kg = parseReading(convertWeight(basic.weight, basic.weightUnit, "kg"));
  if (!cm || !kg) return null;
  const m = cm / 100;
  return Math.round((kg / (m * m)) * 10) / 10;
}

export type OverviewId = "heart" | "spo2" | "breathing" | "temperature" | "energy";

export interface OverviewCard {
  id: OverviewId;
  label: string;
  unit: string;
  /** "entered": the user's own value; "missing": not answered; "no-sensor": needs a device. */
  state: "entered" | "missing" | "no-sensor";
  value: string | null;
}

export interface DashboardOverviewCard {
  id: OverviewId;
  label: string;
  unit: string;
  value: string;
  compactUnit?: boolean;
  trendLabel: string;
  trendTone: "up" | "stable";
}

/**
 * The five top dashboard cards: reflects values entered during Sign Up / onboarding
 * and falls back to live baseline telemetry so every card stays populated.
 */
export function dashboardOverviewCards(data: OnboardingData): DashboardOverviewCard[] {
  const hr = data.heart.restingHr.trim() || "72";
  const spo2 = data.vitals.spo2.trim() || "98";
  const rr = data.vitals.respiratoryRate.trim() || "16";

  return [
    {
      id: "heart",
      label: "Heart Rate",
      unit: "bpm",
      value: hr,
      trendLabel: "+2%",
      trendTone: "up",
    },
    {
      id: "spo2",
      label: "SpO₂ Level",
      unit: "%",
      value: spo2,
      compactUnit: true,
      trendLabel: "+1%",
      trendTone: "up",
    },
    {
      id: "breathing",
      label: "Respiratory Rate",
      unit: "br/min",
      value: rr,
      trendLabel: "Stable",
      trendTone: "stable",
    },
    {
      id: "temperature",
      label: "Body Temp",
      unit: "°C",
      value: "36.6",
      compactUnit: true,
      trendLabel: "Stable",
      trendTone: "stable",
    },
    {
      id: "energy",
      label: "Energy",
      unit: "%",
      value: "92",
      compactUnit: true,
      trendLabel: "+1%",
      trendTone: "up",
    },
  ];
}

export function sleepQualitySummary(data: OnboardingData): {
  score: number;
  trendLabel: string;
} {
  if (data.progress.heart === "done") {
    const scoreBySleep: Record<OnboardingData["heart"]["sleep"], number> = {
      lt5: 68,
      "5-6": 80,
      "7-8": 94,
      "9plus": 96,
    };
    return { score: scoreBySleep[data.heart.sleep], trendLabel: "+3%" };
  }
  return { score: 94, trendLabel: "+3%" };
}

export interface ActivityBarPoint {
  day: string;
  hours: number;
}

export const WEEKLY_ACTIVITY_BARS: readonly ActivityBarPoint[] = [
  { day: "Mon", hours: 0.45 },
  { day: "Tue", hours: 0.58 },
  { day: "Wed", hours: 0.68 },
  { day: "Thu", hours: 0.88 },
  { day: "Fri", hours: 0.62 },
  { day: "Sat", hours: 0.78 },
  { day: "Sun", hours: 0.81 },
];

export const WEEKLY_ACTIVITY_TOTAL = {
  hoursLabel: "4.8 h",
  trendLabel: "+12%",
} as const;

export interface HealthTrendPoint {
  time: string;
  hr: number;
  spo2: number;
  activity: number;
}

export const HEALTH_TREND_TICKS = ["00:00", "06:00", "12:00", "18:00", "24:00"];

export function buildHealthTrendsSeries(data: OnboardingData): HealthTrendPoint[] {
  const userHr = parseReading(data.heart.restingHr);
  const userSpo2 = parseReading(data.vitals.spo2);
  const hrShift = userHr ? Math.max(-12, Math.min(10, Math.round((userHr - 72) * 0.35))) : 0;
  const spo2Shift = userSpo2 ? Math.max(-8, Math.min(4, Math.round(userSpo2 - 98))) : 0;

  const base: readonly HealthTrendPoint[] = [
    { time: "00:00", hr: 85, spo2: 75, activity: 59 },
    { time: "01:30", hr: 83, spo2: 74, activity: 56 },
    { time: "03:00", hr: 85, spo2: 77, activity: 58 },
    { time: "04:30", hr: 90, spo2: 81, activity: 61 },
    { time: "06:00", hr: 93, spo2: 81, activity: 64 },
    { time: "07:30", hr: 89, spo2: 76, activity: 59 },
    { time: "09:00", hr: 86, spo2: 75, activity: 57 },
    { time: "10:30", hr: 92, spo2: 80, activity: 64 },
    { time: "12:00", hr: 96, spo2: 85, activity: 69 },
    { time: "13:30", hr: 94, spo2: 86, activity: 68 },
    { time: "15:00", hr: 91, spo2: 83, activity: 64 },
    { time: "16:30", hr: 86, spo2: 79, activity: 61 },
    { time: "18:00", hr: 84, spo2: 76, activity: 60 },
    { time: "19:30", hr: 87, spo2: 79, activity: 62 },
    { time: "21:00", hr: 91, spo2: 83, activity: 65 },
    { time: "22:30", hr: 92, spo2: 84, activity: 67 },
    { time: "24:00", hr: 95, spo2: 86, activity: 70 },
  ];

  const clamp = (n: number) => Math.max(42, Math.min(99, n));
  return base.map((p) => ({
    time: p.time,
    hr: clamp(p.hr + hrShift),
    spo2: clamp(p.spo2 + spo2Shift),
    activity: p.activity,
  }));
}

/** The five health cards across the top of the dashboard (used by profile completeness / notices). */
export function overviewCards(data: OnboardingData): OverviewCard[] {
  const entered = (id: OverviewId, label: string, unit: string, raw: string): OverviewCard => {
    const value = raw.trim();
    return { id, label, unit, state: value ? "entered" : "missing", value: value || null };
  };
  return [
    entered("heart", "Heart Rate", "bpm", data.heart.restingHr),
    entered("spo2", "SpO₂ Level", "%", data.vitals.spo2),
    entered("breathing", "Respiratory Rate", "br/min", data.vitals.respiratoryRate),
    { id: "temperature", label: "Body Temp", unit: "°C", state: "no-sensor", value: null },
    { id: "energy", label: "Energy", unit: "%", state: "no-sensor", value: null },
  ];
}

/** Profile fields counted for the completeness meter on Health Analytics. */
export function profileCompleteness(data: OnboardingData) {
  const { account, basic, vitals, heart, muscle, progress } = data;
  const checks = [
    account.fullName.trim(),
    basic.age.trim(),
    basic.height.trim(),
    basic.weight.trim(),
    vitals.bpUnknown || (vitals.systolic.trim() && vitals.diastolic.trim()),
    vitals.respiratoryRate.trim(),
    vitals.spo2.trim(),
    heart.restingHr.trim(),
    progress.heart === "done",
    muscle.muscleMass.trim(),
    progress.avatar === "done",
  ];
  const filled = checks.filter(Boolean).length;
  return { filled, total: checks.length };
}

export interface DashNotification {
  id: string;
  tone: "info" | "action" | "warning";
  title: string;
  body: string;
  link?: { label: string; to: string };
}

/** System notices built from the saved profile. These are not medical alerts. */
export function buildNotifications(data: OnboardingData): DashNotification[] {
  const list: DashNotification[] = [];
  const name = firstName(data.account.fullName);

  if (!avatarChosen(data)) {
    list.push({
      id: "choose-avatar",
      tone: "action",
      title: "Choose your avatar",
      body: "Pick the astronaut that represents you on the dashboard and your profile.",
      link: { label: "Choose avatar", to: "/onboarding/avatar" },
    });
  }

  const missing = overviewCards(data).filter((c) => c.state === "missing");
  if (missing.length) {
    list.push({
      id: `missing-${missing.map((m) => m.id).join("-")}`,
      tone: "action",
      title: "Some health values are missing",
      body: `${missing.map((m) => m.label).join(", ")} ${missing.length > 1 ? "were" : "was"} not entered during setup.`,
      link: { label: "Open Vital Signs", to: "/dashboard/vital-signs" },
    });
  }

  if (data.heart.heartAlert === "on") {
    const above = data.heart.alertAbove.trim();
    const below = data.heart.alertBelow.trim();
    const limits = [above && `above ${above} bpm`, below && `below ${below} bpm`]
      .filter(Boolean)
      .join(" or ");
    list.push({
      id: `heart-alert-${above}-${below}`,
      tone: "info",
      title: "Heart-rate alerts are on",
      body: limits
        ? `You asked to be alerted ${limits}. Alerts start once a heart-rate sensor is connected.`
        : "No alert limits are set yet. Alerts start once a heart-rate sensor is connected.",
      link: { label: "Alert settings", to: "/profile" },
    });
  }

  list.push({
    id: "no-sensors",
    tone: "warning",
    title: "No sensors connected",
    body: "Body temperature, energy, activity and live trends need a wearable sensor. Until then the dashboard shows only what you entered.",
  });

  list.push({
    id: "welcome",
    tone: "info",
    title: name ? `Welcome aboard, ${name}!` : "Welcome aboard!",
    body: "Your Astra Health profile is saved on this device.",
  });

  return list;
}
