import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { useOnboarding, type OnboardingData } from "./onboarding-store";
import { stepInfo, stepNeighbors, type OnboardingStep } from "./steps";

const BACK =
  "onb-chip flex h-[48px] w-[86px] shrink-0 items-center justify-center text-[16px] font-bold sm:h-[55px] sm:w-[99px] sm:text-[18px]";
const SKIP = "onb-skip shrink-0 text-[15px] sm:text-[16.5px]";
const CTA =
  "auth-cta flex h-[48px] min-w-[180px] flex-1 items-center justify-center gap-[10px] rounded-full px-[20px] text-[17px] font-bold sm:h-[55px] sm:text-[19.5px]";

/**
 * Back always returns to the previous step (Sign Up from step 2).
 * Continue marks the step done and Skip marks it skipped; both advance to the next step,
 * and from the last step (Launch Dashboard) to the dashboard.
 */
export function StepFooter({
  step,
  nextLabel = "Continue",
}: {
  step: OnboardingStep;
  nextLabel?: string;
}) {
  const { prev, next } = stepNeighbors(step);
  const { data, update } = useOnboarding();
  const { section } = stepInfo(step);
  const last = step === 6;

  const markDone = () => update("progress", { [section]: "done" } as OnboardingData["progress"]);
  const markSkipped = () => {
    if (data.progress[section] !== "done")
      update("progress", { [section]: "skipped" } as OnboardingData["progress"]);
  };

  return (
    <div className="flex flex-wrap items-center gap-[12px] sm:gap-[20px]">
      <Link to={prev} className={BACK}>
        Back
      </Link>
      <Link to={next} className={SKIP} onClick={markSkipped}>
        Skip for now
      </Link>
      <Link to={next} className={CTA} onClick={markDone}>
        {nextLabel}
        {last ? (
          <ArrowRight className="size-[22px] sm:size-[24px]" strokeWidth={2.2} />
        ) : (
          <span aria-hidden className="font-normal">
            →
          </span>
        )}
      </Link>
    </div>
  );
}
