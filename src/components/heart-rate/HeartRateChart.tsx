import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { HEART_RATE_MAJOR_TICKS, type HeartRate24hPoint } from "@/data/heartRateData";

function HeartChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const bpm = payload[0]?.value;
  if (bpm === undefined) return null;

  return (
    <div className="rounded-[10px] border border-dash-cyan/70 bg-[oklch(0.2_0.09_262_/_94%)] px-[11px] py-[7px] shadow-[0_0_16px_oklch(0.8_0.135_228_/_40%)]">
      <p className="text-[11.5px] text-dash-muted">{label} UTC</p>
      <p className="text-[15px] font-bold text-foreground">
        {bpm} <span className="text-[12.5px] font-medium text-dash-cyan">BPM</span>
      </p>
    </div>
  );
}

/** 24-hour Recharts heart rate curve with Normal Range dashed bounds (50 and 85 BPM). */
export function HeartRateChart({
  data,
  normalLow = 50,
  normalHigh = 85,
}: {
  data: readonly HeartRate24hPoint[];
  normalLow?: number;
  normalHigh?: number;
}) {
  const chartData: HeartRate24hPoint[] = [...data];

  return (
    <div className="h-[170px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: -12, bottom: 2 }}>
          <defs>
            <filter id="hrLineGlow" x="-10%" y="-30%" width="120%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00e5ff" />
            </filter>
          </defs>
          <CartesianGrid stroke="rgba(120, 195, 255, 0.16)" vertical={false} />
          <XAxis
            dataKey="time"
            ticks={HEART_RATE_MAJOR_TICKS}
            stroke="rgba(160, 210, 255, 0.35)"
            tick={{ fill: "#e6f2ff", fontSize: 13.5, fontWeight: 500 }}
            tickLine={{ stroke: "rgba(160, 210, 255, 0.35)" }}
            tickMargin={8}
          />
          <YAxis
            domain={[40, 100]}
            ticks={[40, 60, 80, 100]}
            stroke="rgba(160, 210, 255, 0.35)"
            tick={{ fill: "#e6f2ff", fontSize: 13.5, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            content={<HeartChartTooltip />}
            cursor={{ stroke: "rgba(0, 229, 255, 0.4)", strokeWidth: 1.5 }}
          />
          <ReferenceLine
            y={normalHigh}
            stroke="#38d9ff"
            strokeOpacity={0.68}
            strokeDasharray="6 6"
            strokeWidth={1.5}
          />
          <ReferenceLine
            y={normalLow}
            stroke="#38d9ff"
            strokeOpacity={0.68}
            strokeDasharray="6 6"
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey="bpm"
            stroke="#1fe3ff"
            strokeWidth={3}
            filter="url(#hrLineGlow)"
            dot={{
              r: 4,
              fill: "#9ff7ff",
              stroke: "#00d4ff",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6.5,
              fill: "#ffffff",
              stroke: "#00e5ff",
              strokeWidth: 2.5,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
