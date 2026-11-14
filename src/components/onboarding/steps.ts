/** Sign Up is step 1; the health-profile steps follow in this exact order. */
export const TOTAL_STEPS = 6;

export const SIGNUP_PATH = "/signup" as const;
/** Where Launch Dashboard and the last "Skip for now" lead. */
export const DASHBOARD_PATH = "/dashboard" as const;

export const ONBOARDING_STEPS = [
  { step: 2, path: "/onboarding/basic-info", section: "basic", title: "Basic Information" },
  { step: 3, path: "/onboarding/vital-signs", section: "vitals", title: "Vital Signs" },
  { step: 4, path: "/onboarding/heart-recovery", section: "heart", title: "Heart & Recovery" },
  { step: 5, path: "/onboarding/muscle-bone", section: "muscle", title: "Muscle & Bone" },
  { step: 6, path: "/onboarding/avatar", section: "avatar", title: "Choose Your Avatar" },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["step"];
export type OnboardingPath = (typeof ONBOARDING_STEPS)[number]["path"];
export type OnboardingSection = (typeof ONBOARDING_STEPS)[number]["section"];

export function stepInfo(step: OnboardingStep) {
  const found = ONBOARDING_STEPS.find((s) => s.step === step);
  if (!found) throw new Error(`Unknown onboarding step ${step}`);
  return found;
}

/** Where Back and Continue / Skip lead from a step. The last step continues to the dashboard. */
export function stepNeighbors(step: OnboardingStep): {
  prev: OnboardingPath | typeof SIGNUP_PATH;
  next: OnboardingPath | typeof DASHBOARD_PATH;
} {
  const i = ONBOARDING_STEPS.findIndex((s) => s.step === step);
  return {
    prev: (i > 0 && ONBOARDING_STEPS[i - 1]?.path) || SIGNUP_PATH,
    next: ONBOARDING_STEPS[i + 1]?.path ?? DASHBOARD_PATH,
  };
}

/** Number of lit progress segments for a step (Sign Up counts as the first). */
export function filledSegments(step: OnboardingStep) {
  return Math.min(Math.max(step, 0), TOTAL_STEPS);
}

/** Per-page head() metadata, shared by the onboarding steps and dashboard pages. */
export function stepHead(title: string, description: string) {
  const full = `${title} · Astra Health Monitoring System`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
