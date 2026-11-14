import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  TEMPERATURE_DOMAIN,
  TEMPERATURE_MAJOR_TICKS,
  TEMPERATURE_Y_TICKS,
  type TemperatureTrendPoint,
} from "@/data/temperatureData";

function TemperatureTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const temp = payload[0]?.value;
  if (temp === undefined) return null;

  return (
    <div className="rounded-[12px] border border-dash-cyan/70 bg-[oklch(0.2_0.09_262_/_94%)] px-[12px] py-[8px] shadow-[0_0_18px_oklch(0.8_0.135_228_/_40%)] backdrop-blur-[10px]">
      <p className="text-[12px] font-medium text-dash-muted">{label} UTC · Demo</p>
      <p className="mt-[2px] text-[16px] font-bold tabular-nums text-foreground">
        {temp.toFixed(1)} <span className="text-[13px] font-medium text-dash-cyan">°C</span>
      </p>
    </div>
  );
}

/** 24-hour Recharts Body Temperature area/line chart (Y: 35.5–38.0°C, X: 00:00–24:00). */
export function TemperatureTrendChart({ data }: { data: readonly TemperatureTrendPoint[] }) {
  const chartData: TemperatureTrendPoint[] = [...data];

  return (
    <div className="h-[280px] w-full min-w-0 sm:h-[320px] lg:h-full lg:min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={260}>
        <AreaChart data={chartData} margin={{ top: 14, right: 20, left: 4, bottom: 6 }}>
          <defs>
            <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.02} />
            </linearGradient>
            <filter id="tempLineGlow" x="-10%" y="-30%" width="120%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#00e5ff" />
            </filter>
          </defs>
          <CartesianGrid stroke="rgba(120, 195, 255, 0.16)" vertical horizontal />
          <XAxis
            dataKey="time"
            ticks={TEMPERATURE_MAJOR_TICKS}
            stroke="rgba(160, 210, 255, 0.35)"
            tick={{ fill: "#e6f2ff", fontSize: 14.5, fontWeight: 500 }}
            tickLine={{ stroke: "rgba(160, 210, 255, 0.35)" }}
            tickMargin={10}
          />
          <YAxis
            domain={[TEMPERATURE_DOMAIN.min, TEMPERATURE_DOMAIN.max]}
            ticks={TEMPERATURE_Y_TICKS}
            tickFormatter={(v: number) => v.toFixed(1)}
            stroke="rgba(160, 210, 255, 0.35)"
            tick={{ fill: "#e6f2ff", fontSize: 15, fontWeight: 500 }}
            tickLine={{ stroke: "rgba(160, 210, 255, 0.35)" }}
            width={48}
          />
          <Tooltip
            content={<TemperatureTooltip />}
            cursor={{ stroke: "rgba(0, 229, 255, 0.45)", strokeWidth: 1.5 }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="#1fe3ff"
            strokeWidth={3}
            fill="url(#tempAreaGradient)"
            filter="url(#tempLineGlow)"
            dot={{
              r: 4.5,
              fill: "#9ff7ff",
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
