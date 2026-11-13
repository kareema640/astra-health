import nasaLogo from "@/assets/nasa-logo.png.asset.json";
import { cn } from "@/lib/utils";

import { filledSegments, TOTAL_STEPS, type OnboardingStep } from "./steps";

/** NASA mark + product name on the left, step counter and progress segments on the right. */
export function OnboardingHeader({ step }: { step: OnboardingStep }) {
  const filled = filledSegments(step);

  return (
    <header className="flex items-center justify-between compact:flex-col compact:items-start compact:gap-[22px]">
      <div className="flex items-center gap-[18px]">
        <img
          src={nasaLogo.url}
          alt="NASA"
          width={68}
          height={60}
          className="h-[60px] w-[68px] object-contain"
        />
        <div>
          <p className="text-[24.5px] leading-[30px] font-bold tracking-[-0.003em] text-foreground">
            Astra Health Monitoring System
          </p>
          <p className="flex items-center gap-[7px] text-[14.5px] leading-[18px] tracking-[0.04em] text-onb-muted">
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
        className="flex items-center gap-[9.5px]"
      >
        <span className="mr-[1px] text-[15.5px] leading-none text-onb-muted">
          Step {step} of {TOTAL_STEPS}
        </span>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "h-[6px] w-[51px] rounded-full transition-colors duration-500",
              i < filled ? "bg-coral" : "bg-onb-progress",
            )}
          />
        ))}
      </div>
    </header>
  );
}
