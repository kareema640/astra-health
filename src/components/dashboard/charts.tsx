import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

import { HEALTH_TREND_TICKS, type ActivityBarPoint, type HealthTrendPoint } from "./health";

/** Width of an element in its own (unzoomed) layout pixels. */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export interface ChartSeries {
  id: string;
  label: string;
  /** Text-color class; lines are drawn with currentColor. */
  colorClass: string;
  /** Value the user entered, drawn as a dashed reference line. */
  baseline: number | null;
  baselineLabel?: string | undefined;
  /** Put the baseline label under the line (avoids overlapping a neighbour's label). */
  labelBelow?: boolean;
  visible?: boolean;
}

export interface ChartThreshold {
  value: number;
  label: string;
}

/**
 * 24-hour style trend grid. With no recorded history it draws only the axes, the user's
 * entered baselines (dashed) and optional alert limits — never invented data points.
 */
export function TrendsChart({
  height,
  domain,
  ticks,
  xLabels,
  series,
  thresholds = [],
  emptyTitle,
  emptyBody,
  className,
}: {
  height: number;
  domain: [number, number];
  ticks: number[];
  xLabels: string[];
  series: ChartSeries[];
  thresholds?: ChartThreshold[];
  emptyTitle: string;
  emptyBody: string;
  className?: string;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const padL = 44;
  const padR = 14;
  const padT = 10;
  const padB = 30;
  const plotW = Math.max(0, width - padL - padR);
  const plotH = height - padT - padB;
  const [lo, hi] = domain;
  const y = (v: number) =>
    padT + plotH - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * plotH;
  const x = (i: number) => padL + (plotW * i) / Math.max(1, xLabels.length - 1);

  return (
    <div ref={ref} className={cn("relative w-full", className)} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} className="absolute inset-0 overflow-visible" role="img">
          <title>{`${emptyTitle}. ${emptyBody}`}</title>
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={padL}
                x2={padL + plotW}
                y1={y(t)}
                y2={y(t)}
                className="stroke-dash-line"
                strokeWidth={1}
              />
              <text
                x={padL - 12}
                y={y(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-foreground text-[15px]"
              >
                {t}
              </text>
            </g>
          ))}
          <line
            x1={padL}
            x2={padL}
            y1={padT}
            y2={padT + plotH}
            className="stroke-dash-muted/60"
            strokeWidth={1.2}
          />
          {xLabels.map((l, i) => (
            <text
              key={l + i}
              x={x(i)}
              y={height - 6}
              textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
              className="fill-foreground text-[15px]"
            >
              {l}
            </text>
          ))}
          {thresholds.map((t) => (
            <g key={t.label} className="text-coral">
              <line
                x1={padL}
                x2={padL + plotW}
                y1={y(t.value)}
                y2={y(t.value)}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="2 6"
              />
              <text
                x={padL + 6}
                y={y(t.value) - 6}
                className="fill-current text-[12.5px] font-medium"
              >
                {t.label}
              </text>
            </g>
          ))}
          {series
            .filter((s) => s.visible !== false && s.baseline !== null)
            .map((s) => (
              <g key={s.id} className={s.colorClass}>
                <line
                  x1={padL}
                  x2={padL + plotW}
                  y1={y(s.baseline ?? lo)}
                  y2={y(s.baseline ?? lo)}
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeDasharray="9 7"
                  strokeLinecap="round"
                />
                <text
                  x={padL + plotW - 4}
                  y={y(s.baseline ?? lo) + (s.labelBelow ? 18 : -8)}
                  textAnchor="end"
                  className="fill-current text-[13px] font-bold"
                >
                  {s.baselineLabel}
                </text>
              </g>
            ))}
        </svg>
      )}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{ left: padL, right: padR, top: padT, bottom: padB }}
      >
        <div className="dash-pill max-w-[88%] px-[18px] py-[8px] text-center">
          <p className="text-[14.5px] leading-[19px] font-bold text-foreground">{emptyTitle}</p>
          <p className="text-[12.5px] leading-[17px] text-dash-muted">{emptyBody}</p>
        </div>
      </div>
    </div>
  );
}

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Seven empty day tracks: activity bars appear only when a sensor records them. */
export function EmptyWeekBars({ height, className }: { height: number; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-[10px]", className)}>
      {WEEK_DAYS.map((d) => (
        <div key={d} className="flex flex-1 flex-col items-center gap-[6px]">
          <span
            aria-hidden
            className="w-full max-w-[30px] rounded-[6px] border-[1.5px] border-dashed border-dash-line bg-dash-track/30"
            style={{ height }}
          />
          <span className="text-[13px] text-foreground">{d}</span>
        </div>
      ))}
    </div>
  );
}

/** Circular gauge; `fraction` null draws an empty ring. */
export function RingGauge({
  size,
  stroke,
  fraction,
  children,
  label,
}: {
  size: number;
  stroke: number;
  fraction: number | null;
  children?: ReactNode;
  label: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const f = fraction === null ? 0 : Math.min(1, Math.max(0, fraction));
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-dash-track"
        />
        {fraction !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * f} ${c}`}
            className="stroke-dash-cyan drop-shadow-[0_0_6px_var(--dash-cyan)] transition-[stroke-dasharray] duration-700"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** Seven glowing cyan-blue gradient vertical bars (Mon–Sun) matching the Activity card. */
export function WeeklyActivityBars({
  bars,
  height,
  className,
}: {
  bars: readonly ActivityBarPoint[];
  height: number;
  className?: string;
}) {
  const maxHours = Math.max(1, ...bars.map((b) => b.hours));
  return (
    <div className={cn("flex items-end justify-between gap-[10px]", className)}>
      {bars.map((b) => {
        const barH = Math.max(18, Math.round((b.hours / maxHours) * height));
        return (
          <div
            key={b.day}
            title={`${b.day}: ${b.hours.toFixed(1)} h`}
            className="flex flex-1 flex-col items-center gap-[5px]"
          >
            <div className="flex w-full items-end justify-center" style={{ height }}>
              <span
                aria-hidden
                className="w-full max-w-[28px] rounded-t-[6px] rounded-b-[2px] bg-[linear-gradient(180deg,#a6f7ff_0%,#42d4ff_42%,#2478e8_100%)] shadow-[0_0_12px_oklch(0.75_0.16_230_/_45%)] transition-all duration-300"
                style={{ height: barH }}
              />
            </div>
            <span className="text-[13px] leading-[16px] text-foreground/90">{b.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function HealthTrendsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[12px] border border-dash-cyan/60 bg-[oklch(0.2_0.09_262_/_94%)] px-[12px] py-[8px] shadow-[0_0_18px_oklch(0.8_0.135_228_/_35%)] backdrop-blur-[10px]">
      <p className="text-[12px] font-medium text-dash-muted">{label} UTC</p>
      <div className="mt-[4px] flex flex-col gap-[2px]">
        {payload.map((entry) => (
          <p
            key={entry.name}
            className="flex items-center gap-[8px] text-[13.5px] font-semibold text-foreground"
          >
            <span
              className="size-[8px] rounded-full"
              style={{ backgroundColor: entry.color ?? "#38bdf8" }}
            />
            <span className="text-dash-ice/90">{entry.name}:</span>
            <span className="tabular-nums">{entry.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

/** Smooth 3-series 24-hour Recharts line graph matching the Health Trends panel. */
export function LiveHealthTrendsChart({
  data,
  height,
  visible,
  className,
}: {
  data: readonly HealthTrendPoint[];
  height?: number;
  visible: { hr: boolean; spo2: boolean; activity: boolean };
  className?: string;
}) {
  const chartData: HealthTrendPoint[] = [...data];

  return (
    <div
      className={cn("w-full min-w-0", !height && "h-full min-h-[210px]", className)}
      style={height ? { height } : undefined}
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={height ?? 210}>
        <LineChart data={chartData} margin={{ top: 10, right: 14, left: -12, bottom: 2 }}>
          <defs>
            <filter id="dashTrendGlow" x="-10%" y="-30%" width="120%" height="160%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="#38bdf8"
                floodOpacity="0.6"
              />
            </filter>
          </defs>
          <CartesianGrid stroke="rgba(130, 195, 255, 0.14)" vertical horizontal />
          <XAxis
            dataKey="time"
            ticks={HEALTH_TREND_TICKS}
            stroke="rgba(160, 210, 255, 0.25)"
            tick={{ fill: "#e6f2ff", fontSize: 14, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(160, 210, 255, 0.25)" }}
            tickMargin={8}
          />
          <YAxis
            domain={[40, 100]}
            ticks={[40, 60, 80, 100]}
            stroke="rgba(160, 210, 255, 0.25)"
            tick={{ fill: "#e6f2ff", fontSize: 14, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            content={<HealthTrendsTooltip />}
            cursor={{ stroke: "rgba(0, 229, 255, 0.35)", strokeWidth: 1.5 }}
          />
          {visible.hr && (
            <Line
              type="monotone"
              dataKey="hr"
              name="Heart Rate"
              stroke="#338dff"
              strokeWidth={2.75}
              filter="url(#dashTrendGlow)"
              dot={{ r: 3.5, fill: "#70b4ff", stroke: "#338dff", strokeWidth: 1.5 }}
              activeDot={{ r: 5.5, fill: "#ffffff", stroke: "#338dff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          )}
          {visible.spo2 && (
            <Line
              type="monotone"
              dataKey="spo2"
              name="SpO₂"
              stroke="#3ce8ff"
              strokeWidth={2.75}
              filter="url(#dashTrendGlow)"
              dot={{ r: 3.5, fill: "#a6f9ff", stroke: "#3ce8ff", strokeWidth: 1.5 }}
              activeDot={{ r: 5.5, fill: "#ffffff", stroke: "#3ce8ff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          )}
          {visible.activity && (
            <Line
              type="monotone"
              dataKey="activity"
              name="Activity"
              stroke="#eb3ec8"
              strokeWidth={2.75}
              dot={{ r: 3.5, fill: "#ff8ae6", stroke: "#eb3ec8", strokeWidth: 1.5 }}
              activeDot={{ r: 5.5, fill: "#ffffff", stroke: "#eb3ec8", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
