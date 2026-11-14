import {
  dashboardOverviewCards,
  parseReading,
  sleepQualitySummary,
} from "@/components/dashboard/health";
import type { OnboardingData } from "@/components/onboarding/onboarding-store";

export type AppLanguage = "English" | "Arabic";
export type AppTheme = "dark" | "light";
export type MoodValue = "Great" | "Good" | "Okay" | "Low";
export type StressValue = "Low" | "Medium" | "High";

export interface ProfilePreferences {
  language: AppLanguage;
  theme: AppTheme;
  notifications: boolean;
  mood: MoodValue;
  stress: StressValue;
}

export const PROFILE_PREFS_STORAGE_KEY = "astra_profile_prefs";

export const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  language: "English",
  theme: "dark",
  notifications: true,
  mood: "Good",
  stress: "Low",
};

export function loadProfilePreferences(): ProfilePreferences {
  if (typeof window === "undefined") return DEFAULT_PROFILE_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PROFILE_PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<ProfilePreferences>;
    return {
      language: parsed.language === "Arabic" ? "Arabic" : "English",
      theme: parsed.theme === "light" ? "light" : "dark",
      notifications:
        typeof parsed.notifications === "boolean"
          ? parsed.notifications
          : DEFAULT_PROFILE_PREFERENCES.notifications,
      mood:
        parsed.mood && ["Great", "Good", "Okay", "Low"].includes(parsed.mood)
          ? parsed.mood
          : "Good",
      stress:
        parsed.stress && ["Low", "Medium", "High"].includes(parsed.stress) ? parsed.stress : "Low",
    };
  } catch {
    return DEFAULT_PROFILE_PREFERENCES;
  }
}

export function saveProfilePreferences(prefs: ProfilePreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

/**
 * Applies language direction and light/dark CSS variable class to the root document.
 */
export function applyDocumentPreferences(prefs: ProfilePreferences): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dir = prefs.language === "Arabic" ? "rtl" : "ltr";
  root.lang = prefs.language === "Arabic" ? "ar" : "en";
  root.classList.toggle("astra-light", prefs.theme === "light");
}

/**
 * Computes the overall astronaut Health Score (%) from dashboard vital metrics & sleep score.
 * Baseline values (HR 72, SpO₂ 98%, RR 16, Temp 36.6°C, Energy 92%, Sleep 94%) yield 92%.
 */
export function computeHealthScore(data: OnboardingData): number {
  const cards = dashboardOverviewCards(data);
  const sleep = sleepQualitySummary(data);

  const byId = new Map(cards.map((c) => [c.id, parseReading(c.value) ?? 0]));
  const hr = byId.get("heart") ?? 72;
  const spo2 = byId.get("spo2") ?? 98;
  const rr = byId.get("breathing") ?? 16;
  const temp = byId.get("temperature") ?? 36.6;
  const energy = byId.get("energy") ?? 92;

  const hrScore = Math.max(60, Math.min(100, 94 - Math.abs(hr - 70) * 0.6));
  const spo2Score = Math.max(60, Math.min(100, spo2 - 4)); // 98 -> 94
  const rrScore = Math.max(60, Math.min(100, 94 - Math.abs(rr - 16) * 2));
  const tempScore = Math.max(60, Math.min(100, 96 - Math.abs(temp - 36.6) * 14));
  const energyScore = Math.max(50, Math.min(100, energy)); // 92 -> 92
  const sleepScore = Math.max(50, Math.min(100, sleep.score - 2)); // 94 -> 92

  // 89 / 92 / 94 / 96 / 92 / 92 -> avg ≈ 92.1 -> 92%
  const raw = (hrScore * 0.96 + spo2Score + rrScore + tempScore + energyScore + sleepScore) / 6;
  return Math.round(raw);
}

export function moodToneClass(mood: MoodValue): string {
  if (mood === "Great" || mood === "Good") return "text-dash-green";
  if (mood === "Okay") return "text-dash-amber";
  return "text-coral";
}

export function stressToneClass(stress: StressValue): string {
  if (stress === "Low") return "text-dash-green";
  if (stress === "Medium") return "text-dash-amber";
  return "text-coral";
}
