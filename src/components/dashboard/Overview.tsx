import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUp,
  BatteryMedium,
  BedDouble,
  ChartColumn,
  Droplet,
  Heart,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType, type SVGProps } from "react";

import robot from "@/assets/dashboard/ai-assistant-robot.png.asset.json";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { cn } from "@/lib/utils";

import { AvatarFigure, AvatarPortrait } from "./AvatarArt";
import { LiveHealthTrendsChart, RingGauge, WeeklyActivityBars } from "./charts";
import {
  buildHealthTrendsSeries,
  dashboardOverviewCards,
  displayName,
  greetingFor,
  sleepQualitySummary,
  WEEKLY_ACTIVITY_BARS,
  WEEKLY_ACTIVITY_TOTAL,
  type DashboardOverviewCard,
  type OverviewId,
} from "./health";
import { LungsIcon, RunnerIcon } from "./icons";
import { CardHeading } from "./ui";
import { useAccountName } from "./use-account-name";

/** Main dashboard: responsive astronaut greeting & avatar on the left, health overview grid on the right. */
export function DashboardOverview() {
  return (
    <div className="grid w-full flex-1 grid-cols-1 gap-[22px] xl:grid-cols-[minmax(340px,0.84fr)_1.48fr] xl:items-stretch xl:gap-[26px]">
      <HeroSection />

      <div className="flex min-w-0 flex-col gap-[18px] lg:gap-[20px]">
        {/* Five Top Vital Cards */}
        <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 md:grid-cols-5 xl:gap-[16px]">
          <HealthCards />
        </div>

        {/* Middle Row: Sleep Quality + Activity */}
        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-[0.82fr_1.18fr] xl:gap-[22px]">
          <SleepCard className="min-h-[172px]" />
          <ActivityCard className="min-h-[172px]" />
        </div>

        {/* Bottom Row: 24h Health Trends */}
        <TrendsCard className="flex flex-1 flex-col" />
      </div>
    </div>
  );
}

function useGreeting() {
  const { data } = useOnboarding();
  // The authenticated account is the source of truth for the name; the
  // local onboarding store only fills the gap while offline or signed out.
  const { account } = useAccountName();
  return {
    greeting: greetingFor(new Date().getHours()),
    name: account?.first ?? displayName(data),
  };
}

function Greeting() {
  const { greeting, name } = useGreeting();
  const long = name.length > 10;
  return (
    <div className="min-w-0">
      <h1 className="font-bold tracking-[-0.01em]">
        <span className="block text-[26px] leading-[32px] text-foreground sm:text-[32px] sm:leading-[38px] xl:text-[38px] xl:leading-[44px]">
          {greeting},
        </span>
        <span
          className={cn(
            "block break-words text-dash-cyan",
            long
              ? "text-[28px] leading-[34px] sm:text-[32px] sm:leading-[38px] xl:text-[34px] xl:leading-[40px]"
              : "text-[32px] leading-[38px] sm:text-[38px] sm:leading-[44px] xl:text-[42px] xl:leading-[48px]",
          )}
        >
          {name}!{" "}
          <span role="img" aria-label="waving hand">
            👋
          </span>
        </span>
      </h1>
      <p className="mt-[6px] text-[15px] leading-[21px] text-foreground sm:mt-[10px] sm:text-[17px] sm:leading-[24px] xl:text-[19px]">
        Here&apos;s your health overview today.
      </p>
    </div>
  );
}

function HeroSection() {
  return (
    <section
      aria-label="Astronaut Overview"
      className="flex min-w-0 flex-col items-center justify-between gap-[16px] py-[4px] xl:items-start"
    >
      {/* Top Row: Circular Portrait + Tech Connector + Greeting */}
      <div className="relative flex w-full items-center gap-[16px] sm:gap-[20px]">
        <AvatarPortrait size={118} className="sm:size-[136px] xl:size-[146px]" />
        <Greeting />
      </div>

      {/* Center: Full-Body Orbiting Astronaut */}
      <div className="flex w-full flex-1 items-center justify-center py-[4px]">
        <AvatarFigure height={420} className="h-[310px] w-auto sm:h-[370px] xl:h-[430px]" />
      </div>

      {/* Bottom: AI Assistant Floating Teaser */}
      <AssistantTeaser className="self-center xl:self-start" />
    </section>
  );
}

function AssistantTeaser({ className }: { className?: string }) {
  return (
    <Link
      to="/dashboard/assistant"
      aria-label="Open the AI Assistant"
      className={cn("group z-30 flex items-start", className)}
    >
      <span className="dash-ring relative size-[70px] shrink-0 overflow-hidden transition-transform group-hover:scale-105 sm:size-[78px]">
        <img
          src={robot.url}
          alt=""
          className="absolute top-[6px] left-1/2 h-[64px] w-auto -translate-x-1/2 sm:h-[72px]"
        />
      </span>
      <span aria-hidden className="mt-[38px] flex items-center sm:mt-[42px]">
        <span className="h-[1.5px] w-[14px] bg-dash-cyan/80" />
        <span className="size-[8px] rounded-full bg-dash-cyan shadow-[0_0_8px_var(--dash-cyan)]" />
        <span className="h-[1.5px] w-[10px] bg-dash-cyan/80" />
      </span>
      <span className="mt-[8px] flex flex-col items-start sm:mt-[10px]">
        <span className="dash-pill rounded-[20px] px-[18px] py-[8px] text-[15px] leading-[21px] text-foreground transition-colors group-hover:border-dash-cyan sm:px-[22px] sm:py-[10px] sm:text-[16.5px] sm:leading-[23px]">
          Exploring Space,
          <br />
          Caring for You{" "}
          <span role="img" aria-label="rocket">
            🚀
          </span>
        </span>
        <span className="mt-[6px] ml-[5px] flex items-center gap-[7px] rounded-full border-[1.5px] border-dash-cyan/70 bg-dash-blue/55 px-[12px] py-[2px] text-[12.5px] font-bold text-foreground">
          <span className="size-[8px] rounded-full bg-dash-green" />
          AI Assistant
        </span>
      </span>
    </Link>
  );
}

type IconCmp = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

const CARD_ICON: Record<OverviewId, { icon: IconCmp; filled: boolean }> = {
  heart: { icon: Heart, filled: true },
  spo2: { icon: Droplet, filled: true },
  breathing: { icon: LungsIcon, filled: true },
  temperature: { icon: Thermometer, filled: false },
  energy: { icon: BatteryMedium, filled: false },
};

function HealthCards() {
  const { data } = useOnboarding();
  return dashboardOverviewCards(data).map((card, index) => (
    <HealthCard
      key={card.id}
      card={card}
      className={index === 4 ? "col-span-2 sm:col-span-1" : undefined}
    />
  ));
}

function HealthCard({
  card,
  className,
}: {
  card: DashboardOverviewCard;
  className?: string | undefined;
}) {
  const { icon: Icon, filled } = CARD_ICON[card.id];
  const targetTo =
    card.id === "heart"
      ? "/heart-rate"
      : card.id === "spo2"
        ? "/dashboard/oxygen-monitoring"
        : card.id === "breathing"
          ? "/respiratory"
          : card.id === "temperature"
            ? "/body-temperature"
            : "/dashboard/vital-signs";
  return (
    <Link
      to={targetTo}
      aria-label={`${card.label}: ${card.value} ${card.unit}`}
      className={cn(
        "dash-card dash-card-link flex min-h-[168px] min-w-0 cursor-pointer flex-col items-center rounded-[20px] px-[10px] pt-[16px] pb-[14px] text-center hover:-translate-y-[2px]",
        className,
      )}
    >
      <Icon
        className="size-[42px] shrink-0 text-dash-ice drop-shadow-[0_0_10px_var(--dash-cyan)] xl:size-[46px]"
        {...(filled ? { fill: "currentColor", strokeWidth: 0 } : { strokeWidth: 2 })}
      />
      <p className="mt-[10px] flex h-[38px] items-baseline justify-center whitespace-nowrap">
        <span className="max-w-[96px] truncate text-[28px] leading-[36px] font-bold tabular-nums text-foreground xl:text-[31px] xl:leading-[40px]">
          {card.value}
        </span>
        <span
          className={cn(
            "text-foreground",
            card.compactUnit
              ? "ml-[2px] text-[19px] font-bold xl:text-[21px]"
              : "ml-[4px] text-[14.5px] xl:text-[15.5px]",
          )}
        >
          {card.unit}
        </span>
      </p>
      <p className="mt-[2px] text-[14.5px] leading-[19px] text-foreground xl:text-[15px]">
        {card.label}
      </p>
      <span
        className={cn(
          "mt-auto inline-flex items-center gap-[3px] pt-[6px] text-[14px] leading-[18px] font-semibold tabular-nums",
          card.trendTone === "up" ? "text-dash-green" : "text-dash-ice/90",
        )}
      >
        {card.trendTone === "up" ? (
          <ArrowUp className="size-[14px]" strokeWidth={2.8} />
        ) : (
          <ArrowRight className="size-[14px]" strokeWidth={2.4} />
        )}
        {card.trendLabel}
      </span>
    </Link>
  );
}

function SleepCard({ className }: { className?: string }) {
  const { data } = useOnboarding();
  const sleep = sleepQualitySummary(data);
  return (
    <Link
      to="/sleep-quality"
      className={cn(
        "dash-card dash-card-link flex cursor-pointer flex-col rounded-[20px] px-[22px] pt-[16px] pb-[16px] hover:-translate-y-[2px]",
        className,
      )}
    >
      <CardHeading icon={BedDouble} title="Sleep Quality" />
      <div className="mt-auto flex items-end justify-between gap-[12px] pt-[12px]">
        <div className="min-w-0">
          <p className="text-[34px] leading-[40px] font-bold whitespace-nowrap tabular-nums text-foreground xl:text-[36px]">
            {sleep.score}%
          </p>
          <p className="mt-[6px] inline-flex items-center gap-[4px] text-[15px] leading-[20px] font-semibold tabular-nums text-dash-green">
            <ArrowUp className="size-[15px]" strokeWidth={2.8} />
            {sleep.trendLabel}
          </p>
        </div>
        <RingGauge
          size={88}
          stroke={9}
          fraction={sleep.score / 100}
          label={`Sleep quality ${sleep.score}%`}
        >
          <BedDouble className="size-[32px] text-foreground" strokeWidth={1.8} />
        </RingGauge>
      </div>
    </Link>
  );
}

function ActivityCard({ className }: { className?: string }) {
  return (
    <Link
      to="/physical-activity"
      className={cn(
        "dash-card dash-card-link flex cursor-pointer flex-col justify-between gap-[16px] rounded-[20px] px-[22px] pt-[16px] pb-[14px] hover:-translate-y-[2px] sm:flex-row sm:items-stretch",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col">
        <CardHeading icon={RunnerIcon} title="Activity (Exercises)" />
        <div className="mt-auto pt-[12px]">
          <p className="text-[32px] leading-[38px] font-bold whitespace-nowrap tabular-nums text-foreground xl:text-[34px]">
            {WEEKLY_ACTIVITY_TOTAL.hoursLabel}
          </p>
          <p className="mt-[6px] inline-flex items-center gap-[4px] text-[15px] leading-[20px] font-semibold tabular-nums text-dash-green">
            <ArrowUp className="size-[15px]" strokeWidth={2.8} />
            {WEEKLY_ACTIVITY_TOTAL.trendLabel}
          </p>
        </div>
      </div>
      <WeeklyActivityBars
        bars={WEEKLY_ACTIVITY_BARS}
        height={78}
        className="w-full shrink-0 self-end sm:ml-auto sm:w-[220px] xl:w-[258px]"
      />
    </Link>
  );
}

type TrendSeriesKey = "hr" | "spo2" | "activity";

function TrendsCard({ className }: { className?: string }) {
  const { data } = useOnboarding();
  const [visible, setVisible] = useState<Record<TrendSeriesKey, boolean>>({
    hr: true,
    spo2: true,
    activity: true,
  });

  const seriesData = useMemo(() => buildHealthTrendsSeries(data), [data]);

  const toggleSeries = (key: TrendSeriesKey) => {
    setVisible((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.hr && !next.spo2 && !next.activity) return prev;
      return next;
    });
  };

  return (
    <section
      aria-label="Health Trends"
      className={cn(
        "dash-card dash-card-link flex min-h-[260px] flex-col rounded-[20px] px-[22px] pt-[14px] pb-[12px]",
        className,
      )}
    >
      <CardHeading
        icon={ChartColumn}
        title={
          <Link to="/dashboard/trends" className="underline-offset-4 hover:underline">
            Health Trends
          </Link>
        }
        right={<TrendsLegend visible={visible} onToggle={toggleSeries} />}
      />
      <div className="mt-[8px] flex min-h-[205px] flex-1 flex-col">
        <LiveHealthTrendsChart data={seriesData} visible={visible} />
      </div>
    </section>
  );
}

export function TrendsLegend({
  visible,
  onToggle,
}: {
  visible?: Record<TrendSeriesKey, boolean>;
  onToggle?: (key: TrendSeriesKey) => void;
}) {
  const items: Array<{ key: TrendSeriesKey; label: string; className: string }> = [
    { key: "hr", label: "Heart Rate", className: "bg-dash-blue" },
    { key: "spo2", label: "SpO₂", className: "bg-dash-cyan" },
    { key: "activity", label: "Activity", className: "bg-dash-pink" },
  ];
  return (
    <ul className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px]">
      {items.map((i) => {
        const isOn = visible ? visible[i.key] : true;
        return (
          <li key={i.key}>
            <button
              type="button"
              onClick={() => onToggle?.(i.key)}
              aria-pressed={isOn}
              className={cn(
                "flex items-center gap-[7px] text-[14px] text-foreground transition-opacity sm:text-[15px]",
                !isOn && "opacity-45",
              )}
            >
              <span
                aria-hidden
                className={cn("size-[12px] rounded-full sm:size-[14px]", i.className)}
              />
              {i.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
