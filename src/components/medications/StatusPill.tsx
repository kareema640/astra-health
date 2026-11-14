import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { MedicalStatus, SupplementStatus } from "@/data/medicationsData";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: MedicalStatus | SupplementStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  if (status === "Available") {
    return (
      <span
        className={cn(
          "inline-flex h-[30px] min-w-[136px] items-center gap-[8px] rounded-full border border-dash-cyan/50 bg-[linear-gradient(180deg,rgba(20,104,156,0.75)_0%,rgba(12,67,114,0.85)_100%)] px-[14px] text-[13.5px] font-medium whitespace-nowrap text-foreground shadow-[0_0_12px_rgba(0,229,255,0.2)]",
          className,
        )}
      >
        <CheckCircle2 className="size-[15px] shrink-0 text-dash-cyan" strokeWidth={2.2} />
        <span>{status}</span>
      </span>
    );
  }

  if (status === "Restock Soon") {
    return (
      <span
        className={cn(
          "inline-flex h-[30px] min-w-[136px] items-center gap-[8px] rounded-full border border-[#fb923c]/60 bg-[linear-gradient(180deg,rgba(242,107,75,0.92)_0%,rgba(218,74,56,0.92)_100%)] px-[14px] text-[13.5px] font-medium whitespace-nowrap text-white shadow-[0_0_14px_rgba(242,92,60,0.38)]",
          className,
        )}
      >
        <AlertTriangle className="size-[15px] shrink-0 text-white" strokeWidth={2.2} />
        <span>{status}</span>
      </span>
    );
  }

  if (status === "Under Review") {
    return (
      <span
        className={cn(
          "inline-flex h-[30px] min-w-[136px] items-center gap-[8px] rounded-full border border-blue-300/60 bg-[linear-gradient(180deg,rgba(78,154,255,0.92)_0%,rgba(46,112,235,0.94)_100%)] px-[14px] text-[13.5px] font-medium whitespace-nowrap text-white shadow-[0_0_14px_rgba(59,130,246,0.42)]",
          className,
        )}
      >
        <span aria-hidden className="size-[10px] shrink-0 rounded-full bg-blue-100 shadow-sm" />
        <span>{status}</span>
      </span>
    );
  }

  if (status === "Target Met") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-[7px] text-[13.5px] font-medium whitespace-nowrap text-dash-cyan",
          className,
        )}
      >
        <CheckCircle2 className="size-[15px] shrink-0 text-dash-cyan" strokeWidth={2.2} />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] text-[13.5px] font-medium whitespace-nowrap text-[#ff8b6b]",
        className,
      )}
    >
      <span
        aria-hidden
        className="size-[10px] shrink-0 rounded-full bg-[#f97352] shadow-[0_0_8px_rgba(249,115,82,0.7)]"
      />
      <span>{status}</span>
    </span>
  );
}
