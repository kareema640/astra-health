import type { ReactNode } from "react";

import { SpaceBackdrop } from "@/components/auth/SpaceBackdrop";

import { OnboardingHeader } from "./OnboardingHeader";
import type { OnboardingStep } from "./steps";

interface OnboardingSceneProps {
  step: OnboardingStep;
  /** Main form card content. */
  children: ReactNode;
  /** Right-hand panel content ("Why we ask" / avatar preview). */
  aside: ReactNode;
}

/**
 * Full-viewport responsive layout for onboarding steps, keeping the NASA/Astra space backdrop,
 * progress header, main step card, and right-hand explainer/avatar preview panel balanced across
 * mobile, tablet, laptop, and desktop screens without CSS zoom scaling traps.
 */
export function OnboardingScene({ step, children, aside }: OnboardingSceneProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background px-[16px] py-[20px] sm:px-[28px] sm:py-[28px] lg:px-[44px] lg:py-[32px]">
      <SpaceBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-[1460px] flex-1 flex-col gap-[22px] lg:gap-[26px]">
        <OnboardingHeader step={step} />

        <div className="grid flex-1 grid-cols-1 items-stretch gap-[20px] lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-[26px] xl:grid-cols-[minmax(0,1fr)_378px] xl:gap-[30px]">
          <section className="onb-card min-w-0">{children}</section>
          <aside className="onb-card min-w-0">{aside}</aside>
        </div>
      </div>
    </main>
  );
}
