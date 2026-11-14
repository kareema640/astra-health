import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatSleepMinutes, type SleepDayRecord, type SleepRange } from "@/data/sleepData";

function SleepTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: SleepDayRecord }>;
}) {
  const rec = payload?.[0]?.payload;
  if (!active || !rec) return null;

  return (
    <div className="rounded-[12px] border border-dash-cyan/70 bg-[oklch(0.2_0.09_262_/_94%)] px-[14px] py-[9px] shadow-[0_0_18px_oklch(0.8_0.135_228_/_40%)] backdrop-blur-[10px]">
      <p className="text-[12.5px] font-medium text-dash-muted">{rec.fullDate}</p>
      <p className="mt-[2px] text-[16px] font-bold tabular-nums text-foreground">
        {formatSleepMinutes(rec.totalMinutes)}{" "}
        <span className="text-[13px] font-medium text-dash-cyan">· Score {rec.score}/100</span>
      </p>
    </div>
  );
}

function TwoLineDateTick({
  x = 0,
  y = 0,
  payload,
  byIso,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
  byIso: Map<string, SleepDayRecord>;
}) {
  const iso = payload?.value ?? "";
  const rec = byIso.get(iso);
  if (!rec) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={14} textAnchor="middle" fill="#e6f2ff" fontSize={14} fontWeight={500}>
        {rec.weekday}
      </text>
      <text x={0} y={32} textAnchor="middle" fill="#b8d4f4" fontSize={13} fontWeight={400}>
        {rec.shortDate}
      </text>
    </g>
  );
}

/** Recharts area/line chart displaying sleep hours across 7D, 30D, or Custom ranges. */
export function SleepTrendChart({
  data,
  range,
}: {
  data: readonly SleepDayRecord[];
  range: SleepRange;
}) {
  const chartData: SleepDayRecord[] = [...data];
  const byIso = new Map(chartData.map((d) => [d.isoDate, d]));

  const majorTicks =
    chartData.length <= 10
      ? chartData.map((d) => d.isoDate)
      : chartData
          .filter((_, idx) => idx % 5 === 0 || idx === chartData.length - 1)
          .map((d) => d.isoDate);

  return (
    <div className="h-[270px] w-full min-w-0 sm:h-[310px] lg:h-full lg:min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <AreaChart
          key={`${range}-${chartData.length}-${chartData[0]?.isoDate ?? ""}`}
          data={chartData}
          margin={{ top: 14, right: 26, left: 4, bottom: 26 }}
        >
          <defs>
            <linearGradient id="sleepAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.02} />
            </linearGradient>
            <filter id="sleepLineGlow" x="-10%" y="-30%" width="120%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#00e5ff" />
            </filter>
          </defs>
          <CartesianGrid stroke="rgba(120, 195, 255, 0.16)" vertical horizontal />
          <XAxis
            dataKey="isoDate"
            ticks={majorTicks}
            interval={0}
            stroke="rgba(160, 210, 255, 0.35)"
            tickLine={{ stroke: "rgba(160, 210, 255, 0.35)" }}
            tick={<TwoLineDateTick byIso={byIso} />}
            height={44}
          />
          <YAxis
            domain={[4, 10]}
            ticks={[4, 6, 8, 10]}
            tickFormatter={(v: number) => `${v}h`}
            stroke="rgba(160, 210, 255, 0.35)"
            tick={{ fill: "#e6f2ff", fontSize: 15, fontWeight: 500 }}
            tickLine={{ stroke: "rgba(160, 210, 255, 0.35)" }}
            width={46}
          />
          <Tooltip
            content={<SleepTooltip />}
            cursor={{ stroke: "rgba(0, 229, 255, 0.45)", strokeWidth: 1.5 }}
          />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#2de5ff"
            strokeWidth={3}
            fill="url(#sleepAreaGradient)"
            filter="url(#sleepLineGlow)"
            animationDuration={450}
            dot={{
              r: chartData.length > 14 ? 3.2 : 5,
              fill: "#b2f9ff",
              stroke: "#00d4ff",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: "#ffffff",
              stroke: "#00e5ff",
              strokeWidth: 2.5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
