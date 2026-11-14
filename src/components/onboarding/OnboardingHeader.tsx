import nasaLogo from "@/assets/nasa-logo.png.asset.json";
import { cn } from "@/lib/utils";

import { filledSegments, TOTAL_STEPS, type OnboardingStep } from "./steps";

/** NASA mark + product name on the left, step counter and progress segments on the right. */
export function OnboardingHeader({ step }: { step: OnboardingStep }) {
  const filled = filledSegments(step);

  return (
    <header className="flex flex-col items-start justify-between gap-[16px] md:flex-row md:items-center">
      <div className="flex min-w-0 items-center gap-[12px] sm:gap-[18px]">
        <img
          src={nasaLogo.url}
          alt="NASA"
          width={68}
          height={60}
          className="h-[46px] w-[52px] shrink-0 object-contain sm:h-[56px] sm:w-[64px]"
        />
        <div className="min-w-0">
          <p className="text-[19px] leading-[24px] font-bold tracking-[-0.003em] text-foreground sm:text-[23px] sm:leading-[28px] lg:text-[24.5px]">
            Astra Health Monitoring System
          </p>
          <p className="mt-[2px] flex flex-wrap items-center gap-[7px] text-[12.5px] leading-[16px] tracking-[0.04em] text-onb-muted sm:text-[14.5px] sm:leading-[18px]">
            <span>Monitor</span>
            <span aria-hidden className="size-[4px] rounded-full bg-onb-muted" />
            <span>Predict</span>
            <span aria-hidden className="size-[4px] rounded-full bg-onb-muted" />
            <span>Protect</span>
          </p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Profile setup progress"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step}
        className="flex w-full flex-wrap items-center gap-[7px] sm:w-auto sm:gap-[9.5px]"
      >
        <span className="mr-[2px] text-[14px] leading-none whitespace-nowrap text-onb-muted sm:text-[15.5px]">
          Step {step} of {TOTAL_STEPS}
        </span>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "h-[6px] w-[28px] rounded-full transition-colors duration-500 sm:w-[40px] lg:w-[51px]",
              i < filled ? "bg-coral" : "bg-onb-progress",
            )}
          />
        ))}
      </div>
    </header>
  );
}
