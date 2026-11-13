import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { stepNeighbors, type OnboardingStep } from "./steps";

const BACK =
  "onb-chip flex h-[55px] w-[99px] shrink-0 items-center justify-center text-[18px] font-bold";
const SKIP = "onb-skip shrink-0 text-[16.5px]";
const CTA =
  "auth-cta flex h-[55px] min-w-0 flex-1 items-center justify-center gap-[10px] rounded-full text-[19.5px] font-bold";

/**
 * Back always returns to the previous step (Sign Up from step 2).
 * Continue and Skip advance to the next step; on the last step they render without an action.
 */
export function StepFooter({
  step,
  nextLabel = "Continue",
}: {
  step: OnboardingStep;
  nextLabel?: string;
}) {
  const { prev, next } = stepNeighbors(step);

  return (
    <div className="flex items-center gap-[23px]">
      <Link to={prev} className={BACK}>
        Back
      </Link>

      {next ? (
        <>
          <Link to={next} className={SKIP}>
            Skip for now
          </Link>
          <Link to={next} className={CTA}>
            {nextLabel}
            <span aria-hidden className="font-normal">
              →
            </span>
          </Link>
        </>
      ) : (
        <>
          <button type="button" className={SKIP}>
            Skip for now
          </button>
          <button type="button" className={CTA}>
            {nextLabel}
            <ArrowRight className="size-[24px]" strokeWidth={2.2} />
          </button>
        </>
      )}
    </div>
  );
}
