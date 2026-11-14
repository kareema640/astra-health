import {
  ArrowRight,
  Calendar,
  CalendarCheck2,
  Check,
  Clock,
  Heart,
  Lightbulb,
  Play,
  Rocket,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  AthleteOrbitBadge,
  CoralMuscleIcon,
  ExerciseFigure,
} from "@/components/physical-activity/ExerciseFigures";
import {
  AllExercisesModal,
  WorkoutPlayerModal,
} from "@/components/physical-activity/WorkoutPlayerModal";
import { useStoredState } from "@/components/dashboard/use-stored-state";
import {
  getMissionDayAndDate,
  PHYSICAL_ACTIVITY_STATS,
  TODAY_EXERCISES,
} from "@/data/physicalActivityData";
import { cn } from "@/lib/utils";

const COMPLETED_EXERCISES_KEY = "astra-physical-activity-completed-v1";
const DEFAULT_MISSION_SNAPSHOT = { missionDay: 42, formattedDate: "Nov 13, 2026" };

export function PhysicalActivity() {
  const [missionInfo, setMissionInfo] = useState(DEFAULT_MISSION_SNAPSHOT);
  const [completedIds, setCompletedIds] = useStoredState<string[]>(COMPLETED_EXERCISES_KEY, []);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerStartIndex, setPlayerStartIndex] = useState(0);
  const [viewAllOpen, setViewAllOpen] = useState(false);

  useEffect(() => {
    const update = () => setMissionInfo(getMissionDayAndDate(new Date()));
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const toggleCompleted = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const markCompleted = (id: string) => {
    setCompletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const openPlayerAt = (index: number) => {
    setPlayerStartIndex(index);
    setPlayerOpen(true);
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-[20px]">
      {/* Header matching the Physical Activity design */}
      <header className="flex flex-col gap-[12px]">
        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <div className="flex min-w-0 items-center gap-[16px] sm:gap-[20px]">
            <AthleteOrbitBadge className="h-[66px] w-[88px] sm:h-[78px] sm:w-[104px]" />
            <span aria-hidden className="h-[58px] w-[1.5px] shrink-0 bg-white/30" />
            <div className="min-w-0">
              <h1 className="text-[30px] leading-[36px] font-bold tracking-[-0.01em] text-white sm:text-[36px] sm:leading-[42px]">
                Physical Activity
              </h1>
              <p className="mt-[4px] flex items-center gap-[8px] text-[16px] italic text-[#7FB8FF] sm:text-[18.5px]">
                <span>Move more. Live healthier.</span>
                <Heart className="size-[18px] shrink-0 text-[#7FB8FF]" strokeWidth={1.9} />
              </p>
            </div>
          </div>

          {/* Live Mission Day + Date pill badge */}
          <div className="dash-pill inline-flex h-[46px] shrink-0 items-center gap-[14px] px-[18px] text-[14.5px] font-medium text-white sm:px-[22px] sm:text-[15px]">
            <span className="flex items-center gap-[9px] whitespace-nowrap">
              <span
                aria-hidden
                className="size-[11px] rounded-full bg-dash-green shadow-[0_0_10px_var(--dash-green)]"
              />
              <span>Mission Day {missionInfo.missionDay}</span>
            </span>
            <span aria-hidden className="h-[18px] w-[1px] bg-white/35" />
            <span className="flex items-center gap-[8px] whitespace-nowrap">
              <Calendar className="size-[17px] text-[#7FB8FF]" strokeWidth={1.9} />
              <span>{missionInfo.formattedDate}</span>
            </span>
          </div>
        </div>

        {/* Thin glowing line extending to the right under the title */}
        <div className="pl-[104px] sm:pl-[124px]">
          <div className="h-[1px] w-full bg-gradient-to-r from-[#4FA3FF]/55 via-[#4FA3FF]/25 to-transparent shadow-[0_0_10px_rgba(79,163,255,0.4)]" />
        </div>
      </header>

      {/* Stats Row (3 glass cards) */}
      <section aria-label="Activity summary" className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
        {/* Card 1: Your Progress */}
        <div className="dash-card flex min-h-[146px] items-center gap-[20px] rounded-[24px] px-[24px] py-[20px]">
          <CoralMuscleIcon className="size-[58px] shrink-0 drop-shadow-[0_0_12px_rgba(240,115,79,0.4)]" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[15.5px] font-medium text-white/85">Your Progress</span>
            <span className="mt-[2px] text-[34px] leading-[40px] font-bold tabular-nums text-white">
              {PHYSICAL_ACTIVITY_STATS.progressPercent}%
            </span>
            <div className="mt-[10px] h-[11px] w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F0734F] to-[#FF8A65] shadow-[0_0_12px_rgba(240,115,79,0.55)]"
                style={{ width: `${PHYSICAL_ACTIVITY_STATS.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Today's Exercise */}
        <div className="dash-card flex min-h-[146px] items-center gap-[20px] rounded-[24px] px-[24px] py-[20px]">
          <Clock
            className="size-[54px] shrink-0 text-[#7FB8FF] drop-shadow-[0_0_12px_rgba(79,163,255,0.45)]"
            strokeWidth={1.8}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[15.5px] font-medium text-white/85">Today&apos;s Exercise</span>
            <span className="mt-[2px] text-[34px] leading-[40px] font-bold tabular-nums text-white">
              {PHYSICAL_ACTIVITY_STATS.todayMinutes} min
            </span>
            <div className="mt-[10px] h-[11px] w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4FA3FF] to-[#7FB8FF] shadow-[0_0_12px_rgba(79,163,255,0.5)]"
                style={{
                  width: `${Math.round(
                    (PHYSICAL_ACTIVITY_STATS.todayMinutes /
                      PHYSICAL_ACTIVITY_STATS.todayGoalMinutes) *
                      100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Weekly Consistency */}
        <div className="dash-card flex min-h-[146px] items-center gap-[20px] rounded-[24px] px-[24px] py-[20px]">
          <Star
            className="size-[54px] shrink-0 fill-[#F0734F] text-[#FF8A65] drop-shadow-[0_0_12px_rgba(240,115,79,0.45)]"
            strokeWidth={1.5}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[15.5px] font-medium text-white/85">Weekly Consistency</span>
            <span className="mt-[2px] text-[34px] leading-[40px] font-bold tabular-nums text-white">
              {PHYSICAL_ACTIVITY_STATS.weeklyCompletedDays} /{" "}
              {PHYSICAL_ACTIVITY_STATS.weeklyTotalDays}
            </span>
            <div className="mt-[10px] flex items-center gap-[10px]" aria-label="5 of 6 dots active">
              {Array.from({ length: PHYSICAL_ACTIVITY_STATS.weeklyDotCount }).map((_, idx) => {
                const filled = idx < PHYSICAL_ACTIVITY_STATS.weeklyCompletedDays;
                return (
                  <span
                    key={idx}
                    className={cn(
                      "size-[16px] rounded-full",
                      filled
                        ? "bg-gradient-to-br from-[#F0734F] to-[#FF8A65] shadow-[0_0_10px_rgba(240,115,79,0.55)]"
                        : "border-2 border-[#7FB8FF] bg-transparent",
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Today's Mission (Large glass panel) */}
      <section
        aria-label="Today's Mission"
        className="dash-card flex flex-col gap-[20px] rounded-[24px] px-[22px] py-[22px] sm:px-[26px] sm:py-[24px]"
      >
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[12px]">
            <CalendarCheck2
              className="size-[28px] shrink-0 text-white/95 drop-shadow-[0_0_8px_rgba(79,163,255,0.45)]"
              strokeWidth={1.9}
            />
            <h2 className="text-[22px] leading-[28px] font-bold text-white sm:text-[24px]">
              Today&apos;s Mission
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setViewAllOpen(true)}
            className="inline-flex h-[40px] items-center gap-[8px] rounded-full border border-[#4FA3FF]/45 bg-white/[0.06] px-[18px] text-[15px] font-medium text-[#7FB8FF] transition-colors hover:border-[#7FB8FF] hover:bg-white/[0.12] hover:text-white"
          >
            <span>View All</span>
            <ArrowRight className="size-[16px]" />
          </button>
        </div>

        <div className="grid grid-cols-1 items-center gap-[16px] xl:grid-cols-[1fr_1fr_1fr_auto]">
          {TODAY_EXERCISES.map((ex, idx) => {
            const done = completedIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                onClick={() => openPlayerAt(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openPlayerAt(idx);
                  }
                }}
                className={cn(
                  "group relative flex min-h-[214px] cursor-pointer flex-col items-center justify-between rounded-[20px] border px-[18px] pt-[18px] pb-[18px] text-center transition-all hover:-translate-y-[2px]",
                  done
                    ? "border-[#FF8A65]/55 bg-[#0c2766]/65 shadow-[0_0_20px_rgba(240,115,79,0.2)]"
                    : "border-[#4FA3FF]/30 bg-[#0b235c]/50 hover:border-[#7FB8FF]/70 hover:bg-[#102c6f]/65 hover:shadow-[0_0_20px_rgba(79,163,255,0.22)]",
                )}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompleted(ex.id);
                  }}
                  aria-pressed={done}
                  aria-label={`Mark ${ex.name} as ${done ? "incomplete" : "complete"}`}
                  className={cn(
                    "absolute top-[14px] right-[14px] flex size-[24px] items-center justify-center rounded-full border-2 transition-colors",
                    done
                      ? "border-[#FF8A65] bg-gradient-to-br from-[#F0734F] to-[#FF8A65] text-white shadow-[0_0_10px_rgba(240,115,79,0.5)]"
                      : "border-[#7FB8FF]/80 bg-transparent hover:border-white",
                  )}
                >
                  {done && <Check className="size-[14px]" strokeWidth={3} />}
                </button>

                <div className="flex flex-1 items-center justify-center py-[4px]">
                  <ExerciseFigure
                    exerciseId={ex.id}
                    className="h-[118px] w-[148px] transition-transform duration-200 group-hover:scale-[1.04]"
                  />
                </div>

                <div>
                  <h3 className="text-[17px] leading-[22px] font-semibold text-white">{ex.name}</h3>
                  <p className="mt-[3px] text-[14.5px] text-white/75">• {ex.durationSec} sec</p>
                </div>
              </div>
            );
          })}

          {/* Big coral gradient Start Workout CTA */}
          <button
            type="button"
            onClick={() => openPlayerAt(0)}
            className="flex h-[68px] w-full items-center justify-center gap-[12px] rounded-[18px] bg-gradient-to-r from-[#F0734F] to-[#FF8A65] px-[28px] text-[19px] font-bold text-white shadow-[0_0_26px_rgba(240,115,79,0.55),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_34px_rgba(255,138,101,0.75)] active:scale-[0.99] xl:h-[74px] xl:min-w-[215px]"
          >
            <Play className="size-[22px] fill-white text-white" />
            <span>Start Workout</span>
          </button>
        </div>
      </section>

      {/* Full-width Tip Bar */}
      <div className="dash-card relative flex min-h-[70px] items-center justify-between gap-[16px] overflow-hidden rounded-[22px] px-[22px] py-[14px] sm:px-[26px]">
        <div className="relative z-10 flex items-center gap-[16px]">
          <Lightbulb
            className="size-[30px] shrink-0 text-[#F0734F] drop-shadow-[0_0_10px_rgba(240,115,79,0.55)]"
            strokeWidth={2}
          />
          <p className="text-[16px] leading-[23px] font-medium text-white/95 sm:text-[17.5px]">
            A short workout today helps prevent muscle loss in space.
          </p>
        </div>

        {/* Rocket with curved light-blue trail on far right */}
        <div className="relative z-10 flex shrink-0 items-center">
          <Rocket
            className="size-[32px] rotate-[12deg] text-[#7FB8FF] drop-shadow-[0_0_10px_rgba(79,163,255,0.55)]"
            strokeWidth={1.9}
          />
        </div>

        <svg
          viewBox="0 0 260 64"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute right-[12px] bottom-0 h-[56px] w-[240px] opacity-75"
        >
          <defs>
            <linearGradient
              id="pa-rocket-trail"
              x1="0"
              y1="60"
              x2="240"
              y2="12"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#4FA3FF" stopOpacity="0" />
              <stop offset="65%" stopColor="#4FA3FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7FB8FF" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <path
            d="M8 62C88 58 175 40 232 16"
            stroke="url(#pa-rocket-trail)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Full-Screen Animated Workout Player Overlay */}
      <WorkoutPlayerModal
        open={playerOpen}
        exercises={TODAY_EXERCISES}
        initialIndex={playerStartIndex}
        completedIds={completedIds}
        onCompleteExercise={markCompleted}
        onClose={() => setPlayerOpen(false)}
      />

      {/* View All Exercises Modal */}
      <AllExercisesModal
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        onStartWorkout={() => openPlayerAt(0)}
      />
    </div>
  );
}
