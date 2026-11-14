import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BedDouble, ChartColumn, Droplet, HeartPulse, Thermometer } from "lucide-react";
import { useMemo, useState } from "react";

import { LiveHealthTrendsChart } from "@/components/dashboard/charts";
import { buildHealthTrendsSeries } from "@/components/dashboard/health";
import { LungsIcon } from "@/components/dashboard/icons";
import { TrendsLegend } from "@/components/dashboard/Overview";
import { CardHeading, DashCard, PageHeader } from "@/components/dashboard/ui";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { stepHead } from "@/components/onboarding/steps";

export const Route = createFileRoute("/dashboard/trends")({
  head: () =>
    stepHead(
      "Health Trends",
      "24-hour multi-metric trend chart comparing heart rate, blood oxygen saturation, and activity.",
    ),
  component: HealthTrendsPage,
});

type TrendSeriesKey = "hr" | "spo2" | "activity";

function HealthTrendsPage() {
  const { data } = useOnboarding();
  const [visible, setVisible] = useState<Record<TrendSeriesKey, boolean>>({
    hr: true,
    spo2: true,
    activity: true,
  });

  const series = useMemo(() => buildHealthTrendsSeries(data), [data]);

  const stats = useMemo(() => {
    const avg = (vals: number[]) => Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    return {
      hrAvg: avg(series.map((p) => p.hr)),
      hrMax: Math.max(...series.map((p) => p.hr)),
      spo2Avg: avg(series.map((p) => p.spo2)),
      spo2Min: Math.min(...series.map((p) => p.spo2)),
      actAvg: avg(series.map((p) => p.activity)),
      actMax: Math.max(...series.map((p) => p.activity)),
    };
  }, [series]);

  const toggleSeries = (key: TrendSeriesKey) => {
    setVisible((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.hr && !next.spo2 && !next.activity) return prev;
      return next;
    });
  };

  return (
    <div className="flex w-full flex-col gap-[20px]">
      <PageHeader
        title="Health Trends"
        subtitle="Combined 24-hour multi-metric telemetry normalized around your saved baselines."
      />

      {/* 3 Series Summary Cards */}
      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
        <DashCard className="flex items-center justify-between gap-[16px] p-[20px]">
          <div>
            <p className="text-[14px] font-medium text-dash-muted">Heart Rate (24h Avg)</p>
            <p className="mt-[6px] text-[34px] leading-[38px] font-bold tabular-nums text-foreground">
              {stats.hrAvg} <span className="text-[16px] font-medium text-dash-blue">index</span>
            </p>
            <p className="mt-[4px] text-[13px] text-dash-ice/80">Peak window: {stats.hrMax}</p>
          </div>
          <HeartPulse className="size-[40px] shrink-0 text-dash-blue" strokeWidth={1.9} />
        </DashCard>

        <DashCard className="flex items-center justify-between gap-[16px] p-[20px]">
          <div>
            <p className="text-[14px] font-medium text-dash-muted">SpO₂ Stability (24h Avg)</p>
            <p className="mt-[6px] text-[34px] leading-[38px] font-bold tabular-nums text-foreground">
              {stats.spo2Avg} <span className="text-[16px] font-medium text-dash-cyan">index</span>
            </p>
            <p className="mt-[4px] text-[13px] text-dash-ice/80">Low floor: {stats.spo2Min}</p>
          </div>
          <Droplet className="size-[40px] shrink-0 text-dash-cyan" strokeWidth={1.9} />
        </DashCard>

        <DashCard className="flex items-center justify-between gap-[16px] p-[20px]">
          <div>
            <p className="text-[14px] font-medium text-dash-muted">Activity Index (24h Avg)</p>
            <p className="mt-[6px] text-[34px] leading-[38px] font-bold tabular-nums text-foreground">
              {stats.actAvg} <span className="text-[16px] font-medium text-dash-pink">index</span>
            </p>
            <p className="mt-[4px] text-[13px] text-dash-ice/80">Peak effort: {stats.actMax}</p>
          </div>
          <ChartColumn className="size-[40px] shrink-0 text-dash-pink" strokeWidth={1.9} />
        </DashCard>
      </div>

      {/* Interactive Main Chart Card */}
      <DashCard className="flex flex-col p-[20px] sm:p-[26px]">
        <CardHeading
          icon={ChartColumn}
          title="24-Hour Comparative Telemetry"
          right={<TrendsLegend visible={visible} onToggle={toggleSeries} />}
        />
        <p className="mt-[6px] text-[14px] text-dash-muted">
          Click any legend item on the right to isolate or compare curves over the 24-hour UTC
          cycle.
        </p>
        <div className="mt-[16px] h-[300px] w-full sm:h-[360px]">
          <LiveHealthTrendsChart data={series} visible={visible} />
        </div>
      </DashCard>

      {/* Deep-Dive Monitor Links */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-5">
        {[
          { to: "/heart-rate", label: "Heart Rate", sub: "ECG & HRV waveform", icon: HeartPulse },
          {
            to: "/dashboard/oxygen-monitoring",
            label: "SpO₂ Oxygen",
            sub: "Blood saturation",
            icon: Droplet,
          },
          { to: "/respiratory", label: "Respiratory", sub: "Breathing cadence", icon: LungsIcon },
          {
            to: "/body-temperature",
            label: "Body Temp",
            sub: "Thermal stability",
            icon: Thermometer,
          },
          {
            to: "/sleep-quality",
            label: "Sleep Quality",
            sub: "7D & 30D recovery",
            icon: BedDouble,
          },
        ].map((item) => {
          const IconCmp = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="dash-card dash-card-link flex items-center justify-between gap-[12px] rounded-[18px] px-[18px] py-[16px]"
            >
              <div className="flex min-w-0 items-center gap-[12px]">
                <IconCmp className="size-[26px] shrink-0 text-dash-cyan" />
                <div className="min-w-0">
                  <p className="truncate text-[15.5px] font-bold text-foreground">{item.label}</p>
                  <p className="truncate text-[12.5px] text-dash-muted">{item.sub}</p>
                </div>
              </div>
              <ArrowRight className="size-[17px] shrink-0 text-dash-ice" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
