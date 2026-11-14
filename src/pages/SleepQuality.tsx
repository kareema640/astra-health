import { Activity, BarChart3, BedDouble, MoonStar } from "lucide-react";
import { useMemo, useState } from "react";

import { RangeToggle } from "@/components/sleep/RangeToggle";
import { SleepTrendChart } from "@/components/sleep/SleepTrendChart";
import { TipBanner } from "@/components/sleep/TipBanner";
import {
  computeSleepSummary,
  filterSleepRecords,
  SLEEP_MAX_DATE,
  SLEEP_MIN_DATE,
  type SleepRange,
} from "@/data/sleepData";
import { cn } from "@/lib/utils";

/** Glowing crescent moon with floating "zz" icon used in Card 1 and the top-right header badge. */
function MoonZzzIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={cn("text-dash-cyan", className)}>
      <path
        d="M36.5 14C24.9 14 15.5 23.4 15.5 35C15.5 46.6 24.9 56 36.5 56C43.2 56 49.2 52.8 53 47.9C44.1 48.2 36.5 41.2 36.5 32.1C36.5 24.9 40.9 18.7 47.2 16C43.9 14.7 40.3 14 36.5 14Z"
        fill="currentColor"
      />
      <text
        x="38"
        y="25"
        fill="currentColor"
        fontSize="12"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        z
      </text>
      <text
        x="47"
        y="17"
        fill="currentColor"
        fontSize="15"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        z
      </text>
    </svg>
  );
}

/** Header title block: bed icon + "Sleep Quality" + subtitle underneath. */
export function SleepHeaderTitle() {
  return (
    <div className="flex items-center gap-[14px]">
      <BedDouble
        className="size-[36px] shrink-0 text-dash-cyan drop-shadow-[0_0_12px_var(--dash-cyan)] sm:size-[42px]"
        strokeWidth={2}
      />
      <div className="min-w-0">
        <h1 className="text-[24px] leading-[28px] font-bold tracking-[-0.005em] text-foreground sm:text-[31px] sm:leading-[34px]">
          Sleep Quality
        </h1>
        <p className="mt-[2px] text-[13.5px] leading-[18px] font-normal text-dash-ice/90 sm:text-[14.5px]">
          Track your sleep and get better rest{" "}
          <span aria-hidden className="text-dash-ice">
            ♡
          </span>
        </p>
      </div>
    </div>
  );
}

/** Circular glowing moon-with-"zz" button at the far right of the Sleep Quality header. */
export function SleepHeaderBadge() {
  return (
    <span
      aria-label="Sleep Telemetry"
      className="dash-ring flex size-[54px] shrink-0 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,oklch(0.45_0.16_248)_0%,oklch(0.22_0.1_264)_78%)] lg:size-[68px]"
    >
      <MoonZzzIcon className="size-[32px] text-foreground drop-shadow-[0_0_10px_var(--dash-cyan)] lg:size-[42px]" />
    </span>
  );
}

/**
 * Sleep Quality page: 4 responsive top summary cards (computed from sleepData),
 * 7D / 30D / Custom Sleep Trend chart, and dynamic bottom TipBanner.
 */
export function SleepQuality() {
  const [range, setRange] = useState<SleepRange>("7D");
  const [customFrom, setCustomFrom] = useState(SLEEP_MIN_DATE);
  const [customTo, setCustomTo] = useState(SLEEP_MAX_DATE);

  const visibleRecords = useMemo(
    () => filterSleepRecords(range, customFrom, customTo),
    [range, customFrom, customTo],
  );

  const summary = useMemo(
    () => computeSleepSummary(visibleRecords, range),
    [visibleRecords, range],
  );

  const badgeToneClass =
    summary.badge.tone === "green"
      ? "border-dash-green/45 bg-dash-green/22 text-foreground"
      : summary.badge.tone === "amber"
        ? "border-dash-amber/45 bg-dash-amber/22 text-dash-amber"
        : "border-coral/45 bg-coral/22 text-coral";

  const dotToneClass =
    summary.badge.tone === "green"
      ? "bg-dash-green shadow-[0_0_8px_var(--dash-green)]"
      : summary.badge.tone === "amber"
        ? "bg-dash-amber shadow-[0_0_8px_var(--dash-amber)]"
        : "bg-coral shadow-[0_0_8px_var(--coral)]";

  return (
    <div className="flex w-full flex-1 flex-col gap-[18px]">
      {/* Top Stats Row: 4 glass cards */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-[1.28fr_1fr_1fr_1fr] xl:gap-[18px]">
        {/* Card 1: Total Sleep */}
        <div className="dash-card flex min-h-[168px] items-center rounded-[24px] px-[20px] py-[18px] duration-500 animate-in fade-in slide-in-from-bottom-3">
          <div className="dash-float flex shrink-0 items-center justify-center">
            <MoonZzzIcon className="size-[72px] drop-shadow-[0_0_18px_var(--dash-cyan)] sm:size-[80px]" />
          </div>

          <div className="ml-[16px] flex min-w-0 flex-1 flex-col items-start">
            <span
              className={cn(
                "inline-flex items-center gap-[8px] rounded-full border px-[14px] py-[4px] text-[14px] leading-[18px] font-semibold sm:px-[16px] sm:text-[15px]",
                badgeToneClass,
              )}
            >
              <span aria-hidden className={cn("size-[9px] rounded-full", dotToneClass)} />
              <span>{summary.badge.label}</span>
            </span>

            <p className="mt-[10px] text-[36px] leading-[40px] font-bold whitespace-nowrap tabular-nums text-foreground sm:text-[40px] sm:leading-[44px]">
              {summary.totalLabel}
            </p>
            <p className="mt-[4px] text-[15px] leading-[20px] font-medium text-dash-ice/90 sm:text-[16px]">
              Total Sleep
            </p>
          </div>
        </div>

        {/* Card 2: Sleep Efficiency */}
        <div className="dash-card flex min-h-[168px] flex-col items-center justify-center rounded-[24px] px-[18px] py-[16px] text-center duration-500 animate-in fade-in slide-in-from-bottom-3 [animation-delay:75ms]">
          <BedDouble
            className="size-[42px] shrink-0 text-dash-cyan drop-shadow-[0_0_12px_var(--dash-cyan)]"
            strokeWidth={2}
          />
          <p className="mt-[10px] text-[38px] leading-[42px] font-bold tabular-nums text-foreground sm:text-[42px] sm:leading-[46px]">
            {summary.efficiency}%
          </p>
          <p className="mt-[4px] text-[15px] leading-[20px] font-medium text-dash-ice/90 sm:text-[16px]">
            Sleep Efficiency
          </p>
        </div>

        {/* Card 3: Sleep Score */}
        <div className="dash-card flex min-h-[168px] flex-col items-center justify-center rounded-[24px] px-[18px] py-[16px] text-center duration-500 animate-in fade-in slide-in-from-bottom-3 [animation-delay:150ms]">
          <BarChart3
            className="size-[40px] shrink-0 text-dash-cyan drop-shadow-[0_0_12px_var(--dash-cyan)]"
            strokeWidth={2.2}
          />
          <p className="mt-[10px] text-[15px] leading-[20px] font-medium text-dash-ice/90 sm:text-[16px]">
            Sleep Score
          </p>
          <p className="mt-[4px] flex items-baseline justify-center whitespace-nowrap tabular-nums">
            <span className="text-[38px] leading-[42px] font-bold text-foreground sm:text-[42px] sm:leading-[46px]">
              {summary.score}
            </span>
            <span className="ml-[7px] text-[22px] font-normal text-dash-ice/80 sm:text-[24px]">
              / 100
            </span>
          </p>
        </div>

        {/* Card 4: Deep Sleep */}
        <div className="dash-card flex min-h-[168px] flex-col items-center justify-center rounded-[24px] px-[18px] py-[16px] text-center duration-500 animate-in fade-in slide-in-from-bottom-3 [animation-delay:225ms]">
          <MoonStar
            className="size-[38px] shrink-0 text-dash-cyan drop-shadow-[0_0_12px_var(--dash-cyan)]"
            strokeWidth={2}
          />
          <p className="mt-[10px] text-[15px] leading-[20px] font-medium text-dash-ice/90 sm:text-[16px]">
            Deep Sleep
          </p>
          <p className="mt-[4px] text-[34px] leading-[38px] font-bold whitespace-nowrap tabular-nums text-foreground sm:text-[36px] sm:leading-[40px]">
            {summary.deepLabel}
          </p>
          <p className="mt-[2px] text-[14.5px] leading-[18px] font-medium tabular-nums text-dash-ice/80">
            ({summary.deepPercent}%)
          </p>
        </div>
      </div>

      {/* Sleep Trend Panel */}
      <section
        aria-label="Sleep Trend"
        className="dash-card flex min-h-[340px] flex-1 flex-col rounded-[24px] px-[18px] pt-[16px] pb-[14px] sm:px-[26px] duration-500 animate-in fade-in slide-in-from-bottom-3 [animation-delay:250ms]"
      >
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[12px]">
            <Activity
              className="size-[26px] text-dash-cyan drop-shadow-[0_0_8px_var(--dash-cyan)] sm:size-[28px]"
              strokeWidth={2.2}
            />
            <h2 className="text-[20px] leading-[26px] font-bold text-foreground sm:text-[22px]">
              Sleep Trend
            </h2>
          </div>

          <RangeToggle
            value={range}
            onChange={setRange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomChange={(from, to) => {
              setCustomFrom(from);
              setCustomTo(to);
            }}
          />
        </div>

        <div className="mt-[12px] flex min-h-[280px] flex-1 flex-col rounded-[18px] border border-dash-cyan/25 bg-[oklch(0.19_0.08_263_/_52%)] px-[10px] pt-[10px] pb-[6px] shadow-[inset_0_0_24px_oklch(0.24_0.1_260_/_50%)] sm:px-[14px]">
          <div className="min-h-0 flex-1">
            <SleepTrendChart data={visibleRecords} range={range} />
          </div>
        </div>
      </section>

      {/* Bottom Dynamic Tip Banner */}
      <TipBanner message={summary.tip} />
    </div>
  );
}
