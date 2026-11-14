import { ArrowDown, ArrowUp, ArrowUpDown, BarChart3, Thermometer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { TemperatureTrendChart } from "@/components/temperature/TemperatureTrendChart";
import {
  computeTemperatureStats,
  evaluateTemperatureStatus,
  INITIAL_BODY_TEMPERATURE,
  INITIAL_TEMPERATURE_DELTA,
  nextSimulatedTemperature,
  TEMPERATURE_24H_SERIES,
  temperatureRingFraction,
} from "@/data/temperatureData";
import { cn } from "@/lib/utils";

/** Circular glowing thermometer icon badge shown on the top-right of the Body Temperature header. */
export function BodyTemperatureHeaderBadge() {
  return (
    <span
      aria-label="Body Temperature Telemetry"
      className="dash-ring flex size-[54px] shrink-0 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,oklch(0.45_0.16_248)_0%,oklch(0.22_0.1_264)_78%)] lg:size-[68px]"
    >
      <Thermometer
        className="size-[28px] text-dash-ice drop-shadow-[0_0_10px_var(--dash-cyan)] lg:size-[36px]"
        strokeWidth={2.1}
      />
    </span>
  );
}

/**
 * Body Temperature monitoring page: 3 responsive top summary cards (with live 3s simulation,
 * progress ring & status color coding) and a fluid 24-hour Temperature Trend Recharts area/line panel.
 */
export function BodyTemperature() {
  const [temp, setTemp] = useState(INITIAL_BODY_TEMPERATURE);
  const [delta, setDelta] = useState(INITIAL_TEMPERATURE_DELTA);

  const stats = useMemo(() => computeTemperatureStats(TEMPERATURE_24H_SERIES), []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTemp((prev) => {
        const next = nextSimulatedTemperature(prev);
        setDelta(Math.round((next - prev) * 10) / 10);
        return next;
      });
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const statusTone = evaluateTemperatureStatus(temp);
  const fraction = temperatureRingFraction(temp);

  const ringSize = 118;
  const ringStroke = 7;
  const radius = (ringSize - ringStroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const arcStrokeClass =
    statusTone === "normal"
      ? "stroke-dash-cyan drop-shadow-[0_0_8px_var(--dash-cyan)]"
      : statusTone === "amber"
        ? "stroke-dash-amber drop-shadow-[0_0_8px_var(--dash-amber)]"
        : "stroke-coral drop-shadow-[0_0_8px_var(--coral)]";

  const haloBorderClass =
    statusTone === "normal"
      ? "border-dash-cyan/55 shadow-[0_0_24px_oklch(0.8_0.135_228_/_55%)]"
      : statusTone === "amber"
        ? "border-dash-amber/60 shadow-[0_0_24px_oklch(0.84_0.15_78_/_55%)]"
        : "border-coral/65 shadow-[0_0_24px_oklch(0.7_0.18_29_/_55%)]";

  const valueColorClass =
    statusTone === "normal"
      ? "text-foreground"
      : statusTone === "amber"
        ? "text-dash-amber"
        : "text-coral";

  return (
    <div className="flex w-full flex-1 flex-col gap-[20px]">
      {/* Top Stats Row (3 large glass cards) */}
      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3 xl:grid-cols-[1.22fr_1fr_1fr] xl:gap-[20px]">
        {/* Card 1: Glowing progress ring thermometer + Current Temperature */}
        <div className="dash-card flex min-h-[176px] items-center rounded-[20px] px-[20px] py-[18px] sm:px-[22px] duration-500 animate-in fade-in slide-in-from-bottom-3">
          <div
            className="relative flex shrink-0 items-center justify-center"
            style={{ width: ringSize, height: ringSize }}
          >
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-[2px] animate-pulse rounded-full border bg-[radial-gradient(circle_at_50%_35%,oklch(0.42_0.15_248)_0%,oklch(0.21_0.1_264)_80%)]",
                haloBorderClass,
              )}
            />
            <svg
              width={ringSize}
              height={ringSize}
              className="relative z-10 -rotate-90"
              role="img"
              aria-label={`Temperature range progress for ${temp.toFixed(1)} °C`}
            >
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                strokeWidth={ringStroke}
                className="stroke-dash-track"
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                strokeWidth={ringStroke}
                strokeLinecap="round"
                strokeDasharray={`${circumference * fraction} ${circumference}`}
                className={cn("transition-[stroke-dasharray] duration-700", arcStrokeClass)}
              />
            </svg>
            <Thermometer
              className="pointer-events-none absolute z-20 size-[48px] text-dash-ice drop-shadow-[0_0_14px_var(--dash-cyan)]"
              strokeWidth={2}
            />
          </div>

          <div className="ml-[18px] flex min-w-0 flex-1 flex-col items-start sm:ml-[22px]">
            <p className="text-[16px] leading-[21px] font-medium text-foreground sm:text-[17px]">
              Current Temperature
            </p>
            <p className="mt-[6px] flex items-baseline whitespace-nowrap">
              <span
                className={cn(
                  "text-[42px] leading-[46px] font-bold tabular-nums sm:text-[48px] sm:leading-[52px]",
                  valueColorClass,
                )}
              >
                {temp.toFixed(1)}
              </span>
              <span className="ml-[2px] text-[26px] font-semibold text-foreground sm:text-[30px]">
                °C
              </span>
            </p>
            <span
              className={cn(
                "mt-[8px] inline-flex items-center gap-[5px] rounded-full border px-[14px] py-[4px] text-[14.5px] leading-[18px] font-semibold tabular-nums",
                delta > 0
                  ? "border-dash-green/40 bg-dash-green/20 text-dash-green"
                  : delta < 0
                    ? "border-dash-amber/40 bg-dash-amber/20 text-dash-amber"
                    : "border-dash-ice/30 bg-dash-ice/14 text-dash-ice",
              )}
            >
              {delta > 0 ? (
                <>
                  <ArrowUp className="size-[15px]" strokeWidth={2.8} />
                  <span>+{delta.toFixed(1)}°C</span>
                </>
              ) : delta < 0 ? (
                <>
                  <ArrowDown className="size-[15px]" strokeWidth={2.8} />
                  <span>{delta.toFixed(1)}°C</span>
                </>
              ) : (
                <span>Stable</span>
              )}
            </span>
          </div>
        </div>

        {/* Card 2: Average Temperature */}
        <div className="dash-card flex min-h-[176px] items-center justify-center gap-[18px] rounded-[20px] px-[20px] py-[18px] sm:gap-[22px] duration-500 animate-in fade-in slide-in-from-bottom-3 [animation-delay:75ms]">
          <BarChart3
            className="size-[46px] shrink-0 text-dash-cyan drop-shadow-[0_0_12px_var(--dash-cyan)] sm:size-[52px]"
            strokeWidth={2.2}
          />
          <div className="flex flex-col items-start">
            <p className="text-[16.5px] leading-[22px] font-medium text-dash-ice/90">
              Average Temperature
            </p>
            <p className="mt-[8px] flex items-baseline whitespace-nowrap">
              <span className="text-[40px] leading-[44px] font-bold tabular-nums text-foreground sm:text-[46px] sm:leading-[50px]">
                {stats.average.toFixed(1)}
              </span>
              <span className="ml-[2px] text-[24px] font-semibold text-foreground sm:text-[28px]">
                °C
              </span>
            </p>
          </div>
        </div>

        {/* Card 3: Max / Min Temperature */}
        <div className="dash-card flex min-h-[176px] items-center justify-center gap-[18px] rounded-[20px] px-[20px] py-[18px] sm:gap-[20px] duration-500 animate-in fade-in slide-in-from-bottom-3 [animation-delay:150ms]">
          <ArrowUpDown
            className="size-[44px] shrink-0 text-dash-cyan drop-shadow-[0_0_12px_var(--dash-cyan)] sm:size-[48px]"
            strokeWidth={2.2}
          />
          <div className="flex flex-col items-start">
            <p className="text-[16.5px] leading-[22px] font-medium text-dash-ice/90">
              Max / Min Temperature
            </p>
            <p className="mt-[8px] flex items-baseline whitespace-nowrap text-[30px] leading-[38px] font-bold tabular-nums text-foreground sm:text-[36px] sm:leading-[44px]">
              <span>{stats.max.toFixed(1)}</span>
              <span className="text-[20px] font-semibold sm:text-[24px]">°C</span>
              <span className="mx-[6px] font-normal text-dash-ice/80 sm:mx-[8px]">/</span>
              <span>{stats.min.toFixed(1)}</span>
              <span className="text-[20px] font-semibold sm:text-[24px]">°C</span>
            </p>
          </div>
        </div>
      </div>

      {/* Temperature Trend Panel */}
      <section
        aria-label="Temperature Trend"
        className="dash-card flex min-h-[360px] flex-1 flex-col rounded-[20px] px-[18px] py-[18px] sm:px-[26px] duration-500 animate-in fade-in slide-in-from-bottom-3 [animation-delay:225ms]"
      >
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[12px]">
            <Thermometer
              className="size-[26px] text-dash-cyan drop-shadow-[0_0_8px_var(--dash-cyan)] sm:size-[28px]"
              strokeWidth={2.2}
            />
            <h2 className="text-[20px] leading-[26px] font-bold text-foreground sm:text-[22px]">
              Temperature Trend
            </h2>
          </div>

          <div className="flex items-center gap-[10px] text-[15px] font-medium text-foreground">
            <span
              aria-hidden
              className="size-[12px] rounded-full bg-dash-cyan shadow-[0_0_10px_var(--dash-cyan)]"
            />
            <span>Temperature (°C)</span>
          </div>
        </div>

        <div className="mt-[14px] flex min-h-[290px] flex-1 flex-col rounded-[18px] border border-dash-cyan/25 bg-[oklch(0.19_0.08_263_/_52%)] px-[10px] pt-[12px] pb-[8px] shadow-[inset_0_0_24px_oklch(0.24_0.1_260_/_50%)] sm:px-[14px]">
          <div className="min-h-0 flex-1">
            <TemperatureTrendChart data={TEMPERATURE_24H_SERIES} />
          </div>
        </div>
      </section>
    </div>
  );
}
