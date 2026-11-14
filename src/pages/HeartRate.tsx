import { Activity, ArrowUpDown, BarChart3, Check, Heart, HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";

import { EcgMonitor } from "@/components/heart-rate/EcgMonitor";
import { HeartRateChart } from "@/components/heart-rate/HeartRateChart";
import { HeartRateGauge } from "@/components/heart-rate/HeartRateGauge";
import { StatCard } from "@/components/heart-rate/StatCard";
import {
  evaluateHeartRateStatus,
  HEART_RATE_24H_SERIES,
  HEART_RATE_DEMO_STATS,
  nextSimulatedBpm,
} from "@/data/heartRateData";
import { cn } from "@/lib/utils";

/** Circular glowing heart-pulse icon shown on the top-right of the Heart Rate Monitoring header. */
export function HeartRateHeaderBadge() {
  return (
    <span
      aria-label="Heart Rate Telemetry"
      className="dash-ring flex size-[54px] shrink-0 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,oklch(0.45_0.16_248)_0%,oklch(0.22_0.1_264)_78%)] lg:size-[68px]"
    >
      <HeartPulse
        className="size-[26px] text-dash-ice drop-shadow-[0_0_10px_var(--dash-cyan)] lg:size-[34px]"
        strokeWidth={2}
      />
    </span>
  );
}

/**
 * Heart Rate Monitoring page: responsive 5 top stat cards (live 2s simulated BPM),
 * animated ECG waveform, and 3-part Heart Rate Statistics.
 */
export function HeartRate() {
  const [bpm, setBpm] = useState(HEART_RATE_DEMO_STATS.initialBpm);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBpm((prev) => nextSimulatedBpm(prev));
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  const status = evaluateHeartRateStatus(bpm);
  const badgeToneClass =
    status.tone === "normal"
      ? "border-dash-green/50 bg-[oklch(0.42_0.12_155_/_55%)] shadow-[0_0_12px_oklch(0.75_0.18_148_/_25%)]"
      : status.tone === "amber"
        ? "border-dash-amber/60 bg-[oklch(0.45_0.12_78_/_55%)]"
        : "border-coral/70 bg-[oklch(0.42_0.16_28_/_60%)]";
  const dotToneClass =
    status.tone === "normal"
      ? "bg-dash-green shadow-[0_0_8px_var(--dash-green)]"
      : status.tone === "amber"
        ? "bg-dash-amber shadow-[0_0_8px_var(--dash-amber)]"
        : "bg-coral shadow-[0_0_8px_var(--coral)]";

  return (
    <div className="flex w-full flex-1 flex-col gap-[18px]">
      {/* Top Stats Row (5 glass cards) */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.65fr_0.9fr_1fr_1fr_1.15fr] xl:gap-[16px]">
        {/* Card 1: Big circular glowing heart-ECG icon + Normal badge + Live BPM */}
        <div className="dash-card relative flex min-h-[164px] items-center rounded-[20px] px-[18px] py-[16px] sm:col-span-2 xl:col-span-1">
          <div className="dash-ring flex size-[98px] shrink-0 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,oklch(0.45_0.16_248)_0%,oklch(0.22_0.1_264)_80%)] sm:size-[116px]">
            <HeartPulse
              className="size-[48px] text-dash-ice drop-shadow-[0_0_12px_var(--dash-cyan)] sm:size-[56px]"
              strokeWidth={1.9}
            />
          </div>
          <div className="ml-[16px] flex min-w-0 flex-1 flex-col items-start">
            <span
              className={cn(
                "inline-flex items-center gap-[8px] rounded-full border px-[14px] py-[4px] text-[13.5px] font-semibold text-foreground",
                badgeToneClass,
              )}
            >
              <span aria-hidden className={cn("size-[9px] rounded-full", dotToneClass)} />
              {status.label}
            </span>
            <p className="mt-[10px] flex items-baseline whitespace-nowrap">
              <span className="text-[40px] leading-[42px] font-bold tabular-nums text-foreground sm:text-[44px] sm:leading-[46px]">
                {bpm}
              </span>
              <span className="ml-[8px] text-[18px] font-semibold text-dash-ice sm:text-[20px]">
                BPM
              </span>
            </p>
            <p className="mt-[4px] text-[14.5px] font-medium text-dash-ice/90">
              Current Heart Rate
            </p>
          </div>
        </div>

        <StatCard
          icon={
            <Activity
              className="size-[38px] text-dash-cyan drop-shadow-[0_0_10px_var(--dash-cyan)]"
              strokeWidth={2.2}
            />
          }
          value={HEART_RATE_DEMO_STATS.hrvMs}
          unit="ms"
          label="HRV"
        />

        <StatCard
          icon={
            <Heart
              className="size-[38px] text-dash-ice drop-shadow-[0_0_12px_var(--dash-cyan)]"
              fill="currentColor"
              strokeWidth={0}
            />
          }
          value={HEART_RATE_DEMO_STATS.restingHrBpm}
          unit="BPM"
          label="Resting HR"
        />

        <StatCard
          icon={
            <BarChart3
              className="size-[38px] text-dash-cyan drop-shadow-[0_0_10px_var(--dash-cyan)]"
              strokeWidth={2.2}
            />
          }
          value={HEART_RATE_DEMO_STATS.averageHrBpm}
          unit="BPM"
          label="Average HR"
        />

        <StatCard
          icon={
            <ArrowUpDown
              className="size-[36px] text-dash-cyan drop-shadow-[0_0_10px_var(--dash-cyan)]"
              strokeWidth={2.2}
            />
          }
          value={`${HEART_RATE_DEMO_STATS.maxHrBpm} / ${HEART_RATE_DEMO_STATS.minHrBpm}`}
          unit="BPM"
          label="Max / Min HR"
        />
      </div>

      {/* ECG Monitoring Panel */}
      <EcgMonitor bpm={bpm} />

      {/* Heart Rate Statistics Panel (3 parts) */}
      <section
        aria-label="Heart Rate Statistics"
        className="dash-card flex flex-1 flex-col rounded-[20px] px-[20px] py-[16px] sm:px-[24px]"
      >
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[10px]">
            <BarChart3
              className="size-[26px] text-dash-cyan drop-shadow-[0_0_8px_var(--dash-cyan)]"
              strokeWidth={2.2}
            />
            <h2 className="text-[20px] leading-[24px] font-bold text-foreground">
              Heart Rate Statistics
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-[18px] text-[14px] font-medium text-foreground">
            <span className="flex items-center gap-[8px]">
              <span
                aria-hidden
                className="size-[11px] rounded-full bg-dash-blue shadow-[0_0_8px_var(--dash-blue)]"
              />
              Heart Rate
            </span>
            <span className="flex items-center gap-[8px]">
              <span
                aria-hidden
                className="w-[18px] border-t-[2px] border-dashed border-dash-cyan"
              />
              Normal Range
            </span>
          </div>
        </div>

        <div className="mt-[12px] flex min-h-0 flex-1 flex-col items-stretch gap-[20px] lg:flex-row lg:items-center">
          {/* Part 1: Semicircular Gauge */}
          <div className="flex shrink-0 justify-center">
            <HeartRateGauge bpm={bpm} />
          </div>

          <span aria-hidden className="hidden h-[155px] w-[1px] shrink-0 bg-dash-line lg:block" />

          {/* Part 2: 24-Hour Recharts Line Chart */}
          <div className="min-w-0 flex-1">
            <HeartRateChart
              data={HEART_RATE_24H_SERIES}
              normalLow={HEART_RATE_DEMO_STATS.normalChartBand.low}
              normalHigh={HEART_RATE_DEMO_STATS.normalChartBand.high}
            />
          </div>

          {/* Part 3: Healthy Range Card */}
          <div className="flex w-full shrink-0 flex-col justify-between rounded-[18px] border border-dash-cyan/35 bg-[oklch(0.24_0.1_260_/_55%)] px-[20px] py-[16px] shadow-[inset_0_1px_0_oklch(1_0_0_/_12%)] lg:h-[146px] lg:w-[238px]">
            <div className="flex items-center gap-[12px] border-b border-dash-line pb-[12px]">
              <Heart
                className="size-[26px] shrink-0 text-dash-ice drop-shadow-[0_0_10px_var(--dash-cyan)]"
                fill="currentColor"
                strokeWidth={0}
              />
              <span className="text-[17px] font-semibold text-foreground">Healthy Range</span>
            </div>
            <div className="mt-[12px] flex items-center justify-between gap-[10px]">
              <p className="flex items-baseline whitespace-nowrap">
                <span className="text-[28px] leading-[32px] font-bold text-foreground">
                  {HEART_RATE_DEMO_STATS.healthyRange.min} -{" "}
                  {HEART_RATE_DEMO_STATS.healthyRange.max}
                </span>
                <span className="ml-[6px] text-[15px] font-semibold text-dash-ice">BPM</span>
              </p>
              <span
                aria-label="Within healthy range"
                className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-dash-green text-onb-ink shadow-[0_0_12px_var(--dash-green)]"
              >
                <Check className="size-[17px]" strokeWidth={3} />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
