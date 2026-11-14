import { Lightbulb } from "lucide-react";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <path
        d="M14 2.5C14.7 9.4 18.6 13.3 25.5 14C18.6 14.7 14.7 18.6 14 25.5C13.3 18.6 9.4 14.7 2.5 14C9.4 13.3 13.3 9.4 14 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Full-width bottom glass tip bar dynamically reflecting the current Sleep Score. */
export function TipBanner({ message }: { message: string }) {
  return (
    <div className="dash-card flex min-h-[58px] items-center justify-between gap-[14px] rounded-[20px] px-[22px] py-[12px] duration-500 animate-in fade-in slide-in-from-bottom-3 [animation-delay:280ms]">
      <div className="flex min-w-0 items-center gap-[14px]">
        <Lightbulb
          className="size-[24px] shrink-0 text-dash-ice drop-shadow-[0_0_8px_var(--dash-cyan)]"
          strokeWidth={1.9}
        />
        <p className="text-[16.5px] leading-[22px] font-medium text-foreground">{message}</p>
      </div>
      <SparkleIcon className="size-[22px] shrink-0 text-dash-ice/90 drop-shadow-[0_0_10px_var(--dash-cyan)]" />
    </div>
  );
}
