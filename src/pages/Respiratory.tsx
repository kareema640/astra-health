import { Activity, ArrowDown, ArrowUp, ArrowUpDown, BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { RRTrendChart } from "@/components/respiratory/RRTrendChart";
import {
  computeRespiratoryStats,
  evaluateRespiratoryStatus,
  INITIAL_RESPIRATORY_RATE,
  nextSimulatedRespiratoryRate,
  RESPIRATORY_24H_SERIES,
} from "@/data/respiratoryData";
import { cn } from "@/lib/utils";

/** Glowing outlined lungs SVG matching the futuristic respiratory telemetry badge. */
function LungsOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M32 10v19" />
      <path d="M32 25l-7 5" />
      <path d="M32 25l7 5" />
      {/* Left lung */}
      <path d="M27 23c-3.5-4.5-9-4-12.5 1-3.8 5.4-6.5 15.5-6.5 23.5 0 4.8 3.2 7.5 8 7.5 5 0 9.5-2.3 11-5.8V23Z" />
      <path d="M22 33c-3 2-5.5 5.5-6.5 9.5" opacity={0.7} />
      <path d="M23 40c-2.5 1.8-4 4-4.5 6.8" opacity={0.65} />
      {/* Right lung */}
      <path d="M37 23c3.5-4.5 9-4 12.5 1 3.8 5.4 6.5 15.5 6.5 23.5 0 4.8-3.2 7.5-8 7.5-5 0-9.5-2.3-11-5.8V23Z" />
      <path d="M42 33c3 2 5.5 5.5 6.5 9.5" opacity={0.7} />
      <path d="M41 40c2.5 1.8 4 4 4.5 6.8" opacity={0.65} />
    </svg>
  );
}

/** Circular glowing lungs icon button shown on the top-right of the Respiratory Monitoring header. */
export function RespiratoryHeaderBadge() {
  return (
    <span
      aria-label="Respiratory Telemetry"
      className="dash-ring flex size-[54px] shrink-0 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,oklch(0.45_0.16_248)_0%,oklch(0.22_0.1_264)_78%)] lg:size-[68px]"
    >
      <LungsOutlineIcon className="size-[30px] text-dash-ice drop-shadow-[0_0_10px_var(--dash-cyan)] lg:size-[38px]" />
    </span>
  );
}

/**
 * Respiratory Monitoring page: 3 responsive top summary cards (with live 3s simulated RR &
 * breathing-synced pulsing lungs ring) and a fluid 24-hour RR Trend Recharts area/line panel.
 */
export function Respiratory() {
  const [rr, setRr] = useState(INITIAL_RESPIRATORY_RATE);
  const [delta, setDelta] = useState(1);

  const stats = useMemo(() => computeRespiratoryStats(RESPIRATORY_24H_SERIES), []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRr((prev) => {
        const next = nextSimulatedRespiratoryRate(prev);
        setDelta(next - prev);
        return next;
      });
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const statusTone = evaluateRespiratoryStatus(rr);
  const breathCycleSec = (60 / Math.max(8, rr)).toFixed(2);
  const statusValueColor =
    statusTone === "normal"
      ? "text-foreground"
      : statusTone === "amber"
        ? "text-dash-amber"
        : "text-coral";
  const ringBorderColor =
    statusTone === "normal"
      ? "border-dash-cyan shadow-[0_0_24px_oklch(0.8_0.135_228_/_75%),inset_0_0_18px_oklch(0.8_0.135_228_/_45%)]"
      : statusTone === "amber"
        ? "border-dash-amber shadow-[0_0_24px_oklch(0.84_0.15_78_/_75%),inset_0_0_18px_oklch(0.84_0.15_78_/_40%)]"
        : "border-coral shadow-[0_0_24px_oklch(0.7_0.18_29_/_75%),inset_0_0_18px_oklch(0.7_0.18_29_/_40%)]";

  return (
    <div className="flex w-full flex-1 flex-col gap-[20px]">
      {/* Top Stats Row (3 large glass cards) */}
      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3 xl:grid-cols-[1.22fr_1fr_1fr] xl:gap-[20px]">
        {/* Card 1: Glowing pulsing lungs ring + Respiratory Rate (RR) + live value & delta */}
        <div className="dash-card flex min-h-[176px] items-center rounded-[20px] px-[20px] py-[18px] sm:px-[22px]">
          <div className="relative flex size-[104px] shrink-0 items-center justify-center sm:size-[122px]">
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 animate-pulse rounded-full border-[3.5px] bg-[radial-gradient(circle_at_50%_35%,oklch(0.45_0.16_248)_0%,oklch(0.22_0.1_264)_80%)]",
                ringBorderColor,
              )}
              style={{ animationDuration: `${breathCycleSec}s` }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[8px] rounded-full border border-dash-ice/35"
            />
            <LungsOutlineIcon className="relative z-10 size-[52px] text-dash-ice drop-shadow-[0_0_14px_var(--dash-cyan)] sm:size-[62px]" />
          </div>

          <div className="ml-[18px] flex min-w-0 flex-1 flex-col items-start sm:ml-[22px]">
            <p className="text-[16px] leading-[21px] font-medium text-foreground sm:text-[17px]">
              Respiratory Rate (RR)
            </p>
            <p className="mt-[6px] flex items-baseline whitespace-nowrap">
              <span
                className={cn(
                  "text-[42px] leading-[46px] font-bold tabular-nums sm:text-[48px] sm:leading-[52px]",
                  statusValueColor,
                )}
              >
                {rr}
              </span>
              <span className="ml-[8px] text-[19px] font-medium text-dash-ice sm:text-[21px]">
                br/min
              </span>
            </p>
            <p
              className={cn(
                "mt-[6px] inline-flex items-center gap-[4px] text-[15.5px] font-semibold tabular-nums sm:text-[16px]",
                delta >= 0 ? "text-dash-green" : "text-dash-amber",
              )}
            >
              {delta >= 0 ? (
                <ArrowUp className="size-[17px]" strokeWidth={2.8} />
              ) : (
                <ArrowDown className="size-[17px]" strokeWidth={2.8} />
              )}
              <span>{delta >= 0 ? `+${delta}` : delta}/min</span>
            </p>
          </div>
        </div>

        {/* Card 2: Average RR */}
        <div className="dash-card flex min-h-[176px] items-center justify-center gap-[18px] rounded-[20px] px-[20px] py-[18px] sm:gap-[22px]">
          <BarChart3
            className="size-[46px] shrink-0 text-dash-cyan drop-shadow-[0_0_12px_var(--dash-cyan)] sm:size-[52px]"
            strokeWidth={2.2}
          />
          <div className="flex flex-col items-start">
            <p className="text-[16.5px] leading-[22px] font-medium text-dash-ice/90">Average RR</p>
            <p className="mt-[8px] flex items-baseline whitespace-nowrap">
              <span className="text-[40px] leading-[44px] font-bold tabular-nums text-foreground sm:text-[46px] sm:leading-[50px]">
                {stats.average}
              </span>
              <span className="ml-[8px] text-[18px] font-medium text-dash-ice sm:text-[20px]">
                br/min
              </span>
            </p>
          </div>
        </div>

        {/* Card 3: Max / Min RR */}
        <div className="dash-card flex min-h-[176px] items-center justify-center gap-[18px] rounded-[20px] px-[20px] py-[18px] sm:gap-[22px]">
          <ArrowUpDown
            className="size-[44px] shrink-0 text-dash-cyan drop-shadow-[0_0_12px_var(--dash-cyan)] sm:size-[50px]"
            strokeWidth={2.2}
          />
          <div className="flex flex-col items-start">
            <p className="text-[16.5px] leading-[22px] font-medium text-dash-ice/90">
              Max / Min RR
            </p>
            <p className="mt-[8px] flex items-baseline whitespace-nowrap">
              <span className="text-[40px] leading-[44px] font-bold tabular-nums text-foreground sm:text-[46px] sm:leading-[50px]">
                {stats.max} / {stats.min}
              </span>
              <span className="ml-[8px] text-[18px] font-medium text-dash-ice sm:text-[20px]">
                br/min
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* RR Trend Panel */}
      <section
        aria-label="RR Trend"
        className="dash-card flex min-h-[360px] flex-1 flex-col rounded-[20px] px-[18px] py-[18px] sm:px-[26px]"
      >
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[12px]">
            <Activity
              className="size-[26px] text-dash-cyan drop-shadow-[0_0_8px_var(--dash-cyan)] sm:size-[28px]"
              strokeWidth={2.2}
            />
            <h2 className="text-[20px] leading-[26px] font-bold text-foreground sm:text-[22px]">
              RR Trend
            </h2>
          </div>

          <div className="flex items-center gap-[10px] text-[15px] font-medium text-foreground">
            <span
              aria-hidden
              className="size-[12px] rounded-full bg-dash-cyan shadow-[0_0_10px_var(--dash-cyan)]"
            />
            <span>Respiratory Rate</span>
          </div>
        </div>

        <div className="mt-[14px] flex min-h-[290px] flex-1 flex-col rounded-[18px] border border-dash-cyan/25 bg-[oklch(0.19_0.08_263_/_52%)] px-[10px] pt-[12px] pb-[8px] shadow-[inset_0_0_24px_oklch(0.24_0.1_260_/_50%)] sm:px-[14px]">
          <div className="min-h-0 flex-1">
            <RRTrendChart data={RESPIRATORY_24H_SERIES} />
          </div>
        </div>
      </section>
    </div>
  );
}
