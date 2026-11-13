/** Sign Up is step 1; the health-profile steps follow in this exact order. */
export const TOTAL_STEPS = 6;

export const SIGNUP_PATH = "/signup" as const;

export const ONBOARDING_STEPS = [
  { step: 2, path: "/onboarding/basic-info" },
  { step: 3, path: "/onboarding/vital-signs" },
  { step: 4, path: "/onboarding/heart-recovery" },
  { step: 5, path: "/onboarding/muscle-bone" },
  { step: 6, path: "/onboarding/avatar" },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["step"];
export type OnboardingPath = (typeof ONBOARDING_STEPS)[number]["path"];

/** Where Back and Continue / Skip lead from a step. `next` is null on the last step. */
export function stepNeighbors(step: OnboardingStep): {
  prev: OnboardingPath | typeof SIGNUP_PATH;
  next: OnboardingPath | null;
} {
  const i = ONBOARDING_STEPS.findIndex((s) => s.step === step);
  return {
    prev: (i > 0 && ONBOARDING_STEPS[i - 1]?.path) || SIGNUP_PATH,
    next: ONBOARDING_STEPS[i + 1]?.path ?? null,
  };
}

/** Number of lit progress segments for a step (Sign Up counts as the first). */
export function filledSegments(step: OnboardingStep) {
  return Math.min(Math.max(step, 0), TOTAL_STEPS);
}

/** Per-page head() metadata for the onboarding steps. */
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
