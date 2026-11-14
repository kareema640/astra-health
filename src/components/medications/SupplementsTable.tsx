import {
  Atom,
  Bone,
  Brain,
  FlaskConical,
  Pill,
  Settings,
  Sparkles,
  Sun,
  UserCheck,
} from "lucide-react";

import type { SupplementIconKey, SupplementItem } from "@/data/medicationsData";

import { StatusPill } from "./StatusPill";

interface SupplementsTableProps {
  items: readonly SupplementItem[];
}

function SupplementRowIcon({ iconKey }: { iconKey: SupplementIconKey }) {
  const iconClass = "size-[18px] shrink-0 text-dash-ice/90";
  switch (iconKey) {
    case "flask":
      return <FlaskConical className={iconClass} strokeWidth={1.7} />;
    case "sun":
      return <Sun className={iconClass} strokeWidth={1.7} />;
    case "b1":
      return <VitaminBoxIcon label="B1" />;
    case "b2":
      return <VitaminBoxIcon label="B2" />;
    case "b3":
      return <Brain className={iconClass} strokeWidth={1.7} />;
    case "b5":
      return <FlaskConical className={iconClass} strokeWidth={1.7} />;
    case "b6":
      return <Atom className={iconClass} strokeWidth={1.7} />;
    case "b7":
      return <Settings className={iconClass} strokeWidth={1.7} />;
    case "b9":
      return <Sparkles className={iconClass} strokeWidth={1.7} />;
    case "b12":
      return <UserCheck className={iconClass} strokeWidth={1.7} />;
    case "calcium":
      return <Bone className={iconClass} strokeWidth={1.7} />;
    case "magnesium":
      return <Atom className={iconClass} strokeWidth={1.7} />;
  }
}

function VitaminBoxIcon({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border border-dash-ice/75 text-[9px] leading-none font-semibold text-dash-ice/90"
    >
      {label}
    </span>
  );
}

function SupplementColumn({ rows }: { rows: readonly SupplementItem[] }) {
  return (
    <div className="min-w-0 w-full">
      <div className="hidden grid-cols-[1.1fr_1.25fr_0.85fr_1.15fr] items-center gap-[10px] border-b border-dash-line px-[8px] pb-[10px] text-[13.5px] font-medium text-dash-ice/80 md:grid">
        <span className="sr-only">Supplement</span>
        <span>Supplement policy</span>
        <span>Daily target</span>
        <span>Status</span>
      </div>

      <div className="hidden divide-y divide-dash-line/60 md:block">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1.1fr_1.25fr_0.85fr_1.15fr] items-center gap-[10px] rounded-[10px] px-[8px] py-[11px] text-[14.5px] transition-colors hover:bg-dash-cyan/[0.08]"
          >
            <span className="flex min-w-0 items-center gap-[10px] font-medium text-foreground">
              <SupplementRowIcon iconKey={row.iconKey} />
              <span className="truncate">{row.name}</span>
            </span>
            <span className="truncate leading-[1.25] text-foreground/90">{row.policy}</span>
            <span className="whitespace-nowrap tabular-nums text-foreground/90">
              {row.dailyTarget}
            </span>
            <div>
              <StatusPill status={row.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Stacked Cards */}
      <div className="flex flex-col gap-[10px] md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-[16px] border border-dash-line bg-white/[0.03] p-[14px] transition-colors hover:bg-dash-cyan/[0.08]"
          >
            <div className="flex items-center justify-between gap-[10px]">
              <span className="flex items-center gap-[10px] text-[15.5px] font-semibold text-foreground">
                <SupplementRowIcon iconKey={row.iconKey} />
                <span>{row.name}</span>
              </span>
              <StatusPill status={row.status} />
            </div>
            <div className="mt-[10px] grid grid-cols-2 gap-x-[12px] gap-y-[6px] border-t border-dash-line/60 pt-[10px] text-[13.5px]">
              <div>
                <span className="text-dash-ice/70">Policy: </span>
                <span className="text-foreground">{row.policy}</span>
              </div>
              <div>
                <span className="text-dash-ice/70">Daily target: </span>
                <span className="tabular-nums text-foreground">{row.dailyTarget}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SupplementsTable({ items }: SupplementsTableProps) {
  const leftRows = items.filter((item) => item.column === "left");
  const rightRows = items.filter((item) => item.column === "right");

  return (
    <section
      aria-label="Supplements Plan"
      className="dash-card flex w-full flex-1 flex-col rounded-[24px] px-[16px] pt-[18px] pb-[18px] duration-500 animate-in fade-in slide-in-from-bottom-3 [animation-delay:90ms] sm:px-[24px] sm:pt-[20px]"
    >
      <div className="mb-[14px] flex items-center gap-[10px]">
        <Pill
          className="size-[25px] shrink-0 text-dash-cyan drop-shadow-[0_0_10px_var(--dash-cyan)]"
          strokeWidth={1.9}
        />
        <h2 className="text-[21px] leading-[24px] font-bold text-foreground">Supplements</h2>
      </div>

      <div className="grid w-full grid-cols-1 gap-[24px] lg:grid-cols-[1fr_1px_1fr] lg:gap-x-[32px]">
        <SupplementColumn rows={leftRows} />
        <div aria-hidden className="hidden h-full w-px bg-dash-line lg:block" />
        <SupplementColumn rows={rightRows} />
      </div>
    </section>
  );
}
