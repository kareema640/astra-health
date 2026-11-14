import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Reusable glassmorphism summary card for Heart Rate Monitoring metrics. */
export function StatCard({
  icon,
  value,
  unit,
  label,
  className,
}: {
  icon: ReactNode;
  value: string | number;
  unit?: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "dash-card flex min-h-[152px] flex-col items-center justify-center rounded-[20px] px-[14px] py-[16px] text-center sm:min-h-[168px]",
        className,
      )}
    >
      <div className="flex h-[42px] items-center justify-center">{icon}</div>
      <p className="mt-[10px] flex items-baseline justify-center whitespace-nowrap">
        <span className="text-[36px] leading-[40px] font-bold tabular-nums text-foreground">
          {value}
        </span>
        {unit && <span className="ml-[6px] text-[16px] font-semibold text-dash-ice">{unit}</span>}
      </p>
      <p className="mt-[6px] text-[15px] leading-[20px] font-medium text-dash-muted">{label}</p>
    </div>
  );
}
