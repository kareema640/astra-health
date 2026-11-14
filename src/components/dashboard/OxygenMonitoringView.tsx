import { Activity, ArrowUpDown, BarChart3, Droplet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { OXYGEN_DEMO_SNAPSHOT, type OxygenTrendPoint } from "./oxygen-data";

const MAJOR_TICKS = ["00:00", "06:00", "12:00", "18:00", "24:00"];

function OxygenTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  if (value === undefined) return null;

  return (
    <div className="rounded-[12px] border border-dash-cyan/70 bg-[oklch(0.2_0.09_262_/_92%)] px-[12px] py-[8px] shadow-[0_0_18px_oklch(0.8_0.135_228_/_40%)] backdrop-blur-[10px]">
      <p className="text-[12px] font-medium text-dash-muted">{label} UTC · Demo</p>
      <p className="mt-[2px] text-[16px] font-bold text-foreground">
        {value}% <span className="text-[13px] font-medium text-dash-cyan">SpO2</span>
      </p>
    </div>
  );
}

/**
 * Oxygen Monitoring (SpO2) page rendered inside the unified Astra Health DashboardShell.
 * Uses organized demo values from OXYGEN_DEMO_SNAPSHOT until a live oximeter is connected.
 */
export function OxygenMonitoringView() {
  const snapshot = OXYGEN_DEMO_SNAPSHOT;
  const chartData: OxygenTrendPoint[] = [...snapshot.trend24h];

  return (
    <div className="flex w-full flex-1 flex-col gap-[20px]">
      {/* Top Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div className="flex min-w-0 items-center gap-[16px] sm:gap-[20px]">
          <span
            aria-hidden
            className="h-[46px] w-[2.5px] shrink-0 rounded-full bg-dash-cyan shadow-[0_0_12px_var(--dash-cyan)] sm:h-[52px]"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-[10px] sm:gap-[12px]">
              <h1 className="text-[26px] leading-[32px] font-bold tracking-[-0.01em] text-foreground sm:text-[34px] sm:leading-[40px]">
                Oxygen Monitoring (SpO2)
              </h1>
              <span className="rounded-full border border-dash-cyan/45 bg-dash-blue/25 px-[10px] py-[2px] text-[12px] font-medium text-dash-ice">
                Demo Telemetry
              </span>
            </div>
            <p className="mt-[3px] text-[14px] leading-[20px] text-dash-muted sm:text-[14.5px]">
              Blood oxygen saturation &amp; pulse rate overview · Simulated reference values
            </p>
          </div>
        </div>

        {/* Circular O2 icon on top-right */}
        <div
          aria-label="O2 Oxygen Sensor Emblem"
          className="dash-ring flex size-[54px] shrink-0 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,oklch(0.45_0.16_248)_0%,oklch(0.22_0.1_264)_78%)] sm:size-[64px]"
        >
          <span className="text-[20px] font-bold tracking-tight text-dash-ice drop-shadow-[0_0_10px_var(--dash-cyan)] sm:text-[22px]">
            O<sub className="text-[13px] font-bold">2</sub>
          </span>
        </div>
      </div>

      {/* Four Horizontal Summary Cards */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-[1.45fr_1fr_1fr_1.1fr] xl:gap-[18px]">
        {/* Card 1: SpO2 Hero Card */}
        <div className="dash-card flex min-h-[168px] items-center gap-[18px] rounded-[20px] px-[20px] py-[18px] sm:gap-[20px] sm:px-[22px]">
          <div className="dash-ring flex size-[86px] shrink-0 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,oklch(0.45_0.16_248)_0%,oklch(0.22_0.1_264)_80%)] sm:size-[94px]">
            <Droplet
              className="size-[42px] text-dash-ice drop-shadow-[0_0_12px_var(--dash-cyan)] sm:size-[46px]"
              fill="currentColor"
              strokeWidth={0}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="inline-flex items-center gap-[7px] rounded-full border border-dash-green/50 bg-[oklch(0.42_0.12_155_/_45%)] px-[13px] py-[3px] text-[13.5px] font-semibold text-foreground shadow-[0_0_12px_oklch(0.75_0.18_148_/_25%)]">
              <span
                aria-hidden
                className="size-[9px] rounded-full bg-dash-green shadow-[0_0_8px_var(--dash-green)]"
              />
              {snapshot.spo2Status}
            </span>
            <p className="mt-[10px] flex items-baseline whitespace-nowrap">
              <span className="text-[40px] leading-[42px] font-bold tabular-nums text-foreground sm:text-[44px] sm:leading-[46px]">
                {snapshot.spo2Current}
              </span>
              <span className="ml-[3px] text-[22px] font-semibold text-dash-ice sm:text-[24px]">
                %
              </span>
            </p>
            <p className="mt-[4px] text-[15.5px] font-medium text-dash-ice/90">SpO2</p>
          </div>
        </div>

        {/* Card 2: Pulse Rate */}
        <div className="dash-card flex min-h-[168px] flex-col items-center justify-center rounded-[20px] px-[16px] py-[18px] text-center">
          <Activity
            className="size-[40px] text-dash-cyan drop-shadow-[0_0_10px_var(--dash-cyan)]"
            strokeWidth={2.2}
          />
          <p className="mt-[12px] flex items-baseline justify-center whitespace-nowrap">
            <span className="text-[36px] leading-[40px] font-bold tabular-nums text-foreground sm:text-[38px] sm:leading-[42px]">
              {snapshot.pulseRateBpm}
            </span>
            <span className="ml-[6px] text-[16px] font-semibold text-dash-ice sm:text-[17px]">
              BPM
            </span>
          </p>
          <p className="mt-[6px] text-[15px] font-medium text-dash-muted">Pulse Rate</p>
        </div>

        {/* Card 3: Average SpO2 */}
        <div className="dash-card flex min-h-[168px] flex-col items-center justify-center rounded-[20px] px-[16px] py-[18px] text-center">
          <BarChart3
            className="size-[40px] text-dash-cyan drop-shadow-[0_0_10px_var(--dash-cyan)]"
            strokeWidth={2.2}
          />
          <p className="mt-[12px] flex items-baseline justify-center whitespace-nowrap">
            <span className="text-[36px] leading-[40px] font-bold tabular-nums text-foreground sm:text-[38px] sm:leading-[42px]">
              {snapshot.spo2Average}
            </span>
            <span className="ml-[3px] text-[20px] font-semibold text-dash-ice sm:text-[22px]">
              %
            </span>
          </p>
          <p className="mt-[6px] text-[15px] font-medium text-dash-muted">Average SpO2</p>
        </div>

        {/* Card 4: Max / Min SpO2 */}
        <div className="dash-card flex min-h-[168px] flex-col items-center justify-center rounded-[20px] px-[16px] py-[18px] text-center">
          <ArrowUpDown
            className="size-[38px] text-dash-cyan drop-shadow-[0_0_10px_var(--dash-cyan)]"
            strokeWidth={2.2}
          />
          <p className="mt-[12px] flex items-baseline justify-center whitespace-nowrap">
            <span className="text-[30px] leading-[38px] font-bold tabular-nums text-foreground sm:text-[34px] sm:leading-[42px]">
              {snapshot.spo2Max}% / {snapshot.spo2Min}%
            </span>
          </p>
          <p className="mt-[6px] text-[15px] font-medium text-dash-muted">Max / Min SpO2</p>
        </div>
      </div>

      {/* Oxygen Trend Chart Card */}
      <section
        aria-label="Oxygen Trend"
        className="dash-card flex min-h-[340px] flex-1 flex-col rounded-[20px] px-[18px] pt-[18px] pb-[16px] sm:px-[26px]"
      >
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[12px]">
            <Activity
              className="size-[26px] text-dash-cyan drop-shadow-[0_0_8px_var(--dash-cyan)] sm:size-[28px]"
              strokeWidth={2.2}
            />
            <h2 className="text-[20px] leading-[26px] font-bold text-foreground sm:text-[21px]">
              Oxygen Trend
            </h2>
          </div>

          <div className="flex items-center gap-[18px]">
            <div className="flex items-center gap-[8px] text-[15px] font-medium text-foreground">
              <span
                aria-hidden
                className="size-[12px] rounded-full bg-dash-cyan shadow-[0_0_10px_var(--dash-cyan)]"
              />
              <span>SpO2</span>
            </div>
            <span className="text-[12.5px] text-dash-muted">24-hour demo curve</span>
          </div>
        </div>

        {/* Inner Chart Frame */}
        <div className="mt-[14px] flex min-h-[280px] flex-1 flex-col rounded-[18px] border border-dash-cyan/30 bg-[oklch(0.18_0.08_263_/_55%)] px-[10px] pt-[14px] pb-[8px] shadow-[inset_0_0_24px_oklch(0.24_0.1_260_/_55%)] sm:px-[14px]">
          <div className="h-[260px] w-full min-w-0 sm:h-[300px] lg:h-full lg:flex-1 lg:min-h-[270px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <AreaChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="spo2AreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38d9ff" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#38d9ff" stopOpacity={0.02} />
                  </linearGradient>
                  <filter id="spo2LineGlow" x="-10%" y="-30%" width="120%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38d9ff" />
                  </filter>
                </defs>
                <CartesianGrid
                  stroke="rgba(120, 195, 255, 0.18)"
                  strokeDasharray="3 3"
                  vertical
                  horizontal
                />
                <XAxis
                  dataKey="time"
                  ticks={MAJOR_TICKS}
                  stroke="rgba(160, 210, 255, 0.35)"
                  tick={{ fill: "#e6f2ff", fontSize: 14, fontWeight: 500 }}
                  tickLine={{ stroke: "rgba(160, 210, 255, 0.35)" }}
                  tickMargin={10}
                />
                <YAxis
                  domain={[85, 100]}
                  ticks={[85, 90, 95, 100]}
                  tickFormatter={(val: number) => `${val}%`}
                  stroke="rgba(160, 210, 255, 0.35)"
                  tick={{ fill: "#e6f2ff", fontSize: 14, fontWeight: 500 }}
                  tickLine={false}
                  width={54}
                />
                <Tooltip
                  content={<OxygenTooltip />}
                  cursor={{ stroke: "rgba(56, 217, 255, 0.45)", strokeWidth: 1.5 }}
                />
                <Area
                  type="monotone"
                  dataKey="spo2"
                  stroke="#38d9ff"
                  strokeWidth={3.2}
                  fill="url(#spo2AreaGradient)"
                  filter="url(#spo2LineGlow)"
                  dot={{
                    r: 5,
                    fill: "#5ee7ff",
                    stroke: "#ffffff",
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 7.5,
                    fill: "#ffffff",
                    stroke: "#38d9ff",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-[4px] px-[8px] text-right text-[12px] text-dash-muted">
            Demo readings shown for layout preview — live sensor integration will replace these
            values automatically.
          </p>
        </div>
      </section>
    </div>
  );
}
