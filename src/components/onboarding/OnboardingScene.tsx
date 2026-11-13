import type { ReactNode } from "react";

import { SpaceBackdrop } from "@/components/auth/SpaceBackdrop";
import { useStageScale, type StageSize } from "@/components/auth/use-stage-scale";
import { cn } from "@/lib/utils";

import { OnboardingHeader } from "./OnboardingHeader";
import type { OnboardingStep } from "./steps";

/** Health-profile artboard: the step designs are 16:10. */
const ONBOARDING_STAGE: StageSize = { width: 1600, height: 1000, compactWidth: 640 };

interface OnboardingSceneProps {
  step: OnboardingStep;
  /** Main form card content. */
  children: ReactNode;
  /** Right-hand panel content ("Why we ask" / avatar preview). */
  aside: ReactNode;
}

/**
 * Same space backdrop as the login screens, with the brand header, step progress,
 * the form card and the side panel placed on the 1600×1000 reference artboard.
 */
export function OnboardingScene({ step, children, aside }: OnboardingSceneProps) {
  const { mode, scale, ready } = useStageScale(ONBOARDING_STAGE);

  return (
    <main data-stage={mode} className="relative min-h-screen w-full overflow-hidden bg-background">
      <SpaceBackdrop mode={mode} />

      {mode === "desktop" ? (
        <div
          className={cn(
            "relative flex h-screen items-center justify-center",
            ready ? "stage-fade-in" : "opacity-0",
          )}
        >
          <div
            className="relative shrink-0"
            style={{ width: ONBOARDING_STAGE.width, height: ONBOARDING_STAGE.height, zoom: scale }}
          >
            <div className="absolute top-[38px] right-[70px] left-[71px]">
              <OnboardingHeader step={step} />
            </div>
            <section className="onb-card absolute top-[125px] left-[71px] h-[836px] w-[1050px]">
              {children}
            </section>
            <aside className="onb-card absolute top-[125px] left-[1152px] h-[836px] w-[378px]">
              {aside}
            </aside>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "relative flex min-h-screen justify-center py-6",
            ready ? "stage-fade-in" : "opacity-0",
          )}
        >
          <div
            className="flex flex-col gap-[28px]"
            style={{ width: ONBOARDING_STAGE.compactWidth, zoom: scale }}
          >
            <div className="px-[8px]">
              <OnboardingHeader step={step} />
            </div>
            <section className="onb-card">{children}</section>
            <aside className="onb-card">{aside}</aside>
          </div>
        </div>
      )}
    </main>
  );
}
