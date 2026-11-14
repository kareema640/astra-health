import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUp, Check, Dumbbell, Flame, Pencil, Plus, Timer, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { WeeklyActivityBars } from "@/components/dashboard/charts";
import {
  BONE_LABEL,
  EMG_LABEL,
  WEEKLY_ACTIVITY_BARS,
  WEEKLY_ACTIVITY_TOTAL,
} from "@/components/dashboard/health";
import { RunnerIcon } from "@/components/dashboard/icons";
import {
  CardHeading,
  DASH_BTN,
  DASH_GHOST,
  DashCard,
  InfoRow,
  PageHeader,
} from "@/components/dashboard/ui";
import { useStoredState } from "@/components/dashboard/use-stored-state";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { stepHead } from "@/components/onboarding/steps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/activity")({
  head: () =>
    stepHead(
      "Activity",
      "Weekly exercise volume, muscle/bone profile, and microgravity countermeasure log.",
    ),
  component: ActivityPage,
});

interface WorkoutSession {
  id: string;
  name: string;
  durationMin: number;
  focus: string;
  completed: boolean;
}

const ACTIVITY_LOG_KEY = "astra-activity-sessions-v1";

const DEFAULT_SESSIONS: WorkoutSession[] = [
  {
    id: "ared",
    name: "ARED Squats & Deadlifts",
    durationMin: 40,
    focus: "Lower Body / Bone",
    completed: true,
  },
  {
    id: "t2",
    name: "T2 Treadmill Interval Run",
    durationMin: 30,
    focus: "Cardio / Aerobic",
    completed: true,
  },
  {
    id: "cevis",
    name: "CEVIS Ergometer Cycle",
    durationMin: 25,
    focus: "Endurance",
    completed: false,
  },
  {
    id: "core",
    name: "Microgravity Core Stabilization",
    durationMin: 20,
    focus: "Postural Stability",
    completed: false,
  },
];

function ActivityPage() {
  const { data } = useOnboarding();
  const [sessions, setSessions] = useStoredState<WorkoutSession[]>(
    ACTIVITY_LOG_KEY,
    DEFAULT_SESSIONS,
  );
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("25");
  const [focus, setFocus] = useState("Resistance");

  const completedCount = sessions.filter((s) => s.completed).length;
  const totalLoggedMin = sessions.reduce((sum, s) => sum + (s.completed ? s.durationMin : 0), 0);

  const toggleSession = (id: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const removeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const mins = Math.max(5, Math.min(180, Number(duration) || 25));
    setSessions((prev) => [
      ...prev,
      { id: `wk-${Date.now()}`, name: trimmed, durationMin: mins, focus, completed: false },
    ]);
    setName("");
  };

  return (
    <div className="flex w-full flex-col gap-[20px]">
      <PageHeader
        title="Activity & Exercise"
        subtitle="Weekly orbital exercise volume, musculoskeletal baseline, and countermeasure training log."
        actions={
          <Link to="/onboarding/muscle-bone" className={DASH_GHOST}>
            <Pencil className="size-[16px]" />
            Update Muscle &amp; Bone
          </Link>
        }
      />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        <DashCard className="flex flex-col justify-between p-[22px]">
          <CardHeading icon={RunnerIcon} title="Weekly Total" />
          <div className="mt-[14px] flex items-baseline justify-between">
            <span className="text-[36px] leading-[40px] font-bold tabular-nums text-foreground">
              {WEEKLY_ACTIVITY_TOTAL.hoursLabel}
            </span>
            <span className="inline-flex items-center gap-[4px] rounded-full border border-dash-green/45 bg-dash-green/18 px-[10px] py-[2px] text-[13.5px] font-semibold text-dash-green">
              <ArrowUp className="size-[14px]" strokeWidth={2.8} />
              {WEEKLY_ACTIVITY_TOTAL.trendLabel}
            </span>
          </div>
          <p className="mt-[8px] text-[13.5px] text-dash-muted">Simulated baseline schedule</p>
        </DashCard>

        <DashCard className="flex flex-col justify-between p-[22px]">
          <CardHeading icon={Timer} title="Completed Today" />
          <div className="mt-[14px] flex items-baseline gap-[8px]">
            <span className="text-[36px] leading-[40px] font-bold tabular-nums text-foreground">
              {totalLoggedMin}
            </span>
            <span className="text-[16px] font-medium text-dash-ice">min</span>
          </div>
          <p className="mt-[8px] text-[13.5px] text-dash-muted">
            {completedCount} of {sessions.length} sessions checked
          </p>
        </DashCard>

        <DashCard className="flex flex-col justify-between p-[22px]">
          <CardHeading icon={Dumbbell} title="Muscle Mass" />
          <div className="mt-[14px] flex items-baseline gap-[6px]">
            <span className="text-[36px] leading-[40px] font-bold tabular-nums text-foreground">
              {data.muscle.muscleMass.trim() || "—"}
            </span>
            {data.muscle.muscleMass.trim() && (
              <span className="text-[16px] font-medium text-dash-ice">kg</span>
            )}
          </div>
          <p className="mt-[8px] text-[13.5px] text-dash-muted">
            {data.muscle.muscleMass.trim() ? "From your profile" : "Not entered in setup"}
          </p>
        </DashCard>

        <DashCard className="flex flex-col justify-between p-[22px]">
          <CardHeading icon={Flame} title="Target EMG Focus" />
          <div className="mt-[14px]">
            <span className="text-[28px] leading-[36px] font-bold text-foreground">
              {EMG_LABEL[data.muscle.emgGroup]}
            </span>
          </div>
          <p className="mt-[8px] text-[13.5px] text-dash-muted">
            Bone density: {BONE_LABEL[data.muscle.boneDensity]}
          </p>
        </DashCard>
      </div>

      {/* Main Split Grid: Weekly Chart + Workout Log */}
      <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-[1.05fr_1.2fr]">
        <div className="flex flex-col gap-[20px]">
          <DashCard className="flex flex-col p-[22px] sm:p-[24px]">
            <CardHeading icon={RunnerIcon} title="7-Day Activity Breakdown" />
            <p className="mt-[6px] text-[14.5px] text-dash-muted">
              Daily active training duration across your orbital countermeasure cycle.
            </p>
            <div className="mt-[22px] rounded-[18px] border border-dash-line bg-white/[0.03] px-[16px] pt-[24px] pb-[14px]">
              <WeeklyActivityBars bars={WEEKLY_ACTIVITY_BARS} height={150} className="w-full" />
            </div>
            <div className="mt-[16px] grid grid-cols-2 gap-[10px] sm:grid-cols-4">
              {WEEKLY_ACTIVITY_BARS.slice(0, 4).map((b) => (
                <div
                  key={b.day}
                  className="rounded-[12px] border border-dash-line bg-white/[0.03] px-[12px] py-[8px]"
                >
                  <div className="text-[12.5px] text-dash-muted">{b.day}</div>
                  <div className="text-[16px] font-bold tabular-nums text-foreground">
                    {Math.round(b.hours * 60)} min
                  </div>
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard className="p-[22px] sm:p-[24px]">
            <CardHeading icon={Dumbbell} title="Musculoskeletal Profile" />
            <div className="mt-[10px]">
              <InfoRow
                label="Muscle Mass"
                value={
                  data.muscle.muscleMass.trim() ? `${data.muscle.muscleMass} kg` : "Not entered"
                }
              />
              <InfoRow label="Bone Density (T-score)" value={BONE_LABEL[data.muscle.boneDensity]} />
              <InfoRow label="Primary EMG Group" value={EMG_LABEL[data.muscle.emgGroup]} />
              <InfoRow
                label="EMG / DEXA Reports"
                value={
                  data.muscle.emgFile || data.muscle.dexaFile
                    ? [data.muscle.emgFile, data.muscle.dexaFile].filter(Boolean).join(", ")
                    : "None uploaded"
                }
              />
            </div>
          </DashCard>
        </div>

        {/* Interactive Countermeasure Checklist */}
        <DashCard className="flex flex-col p-[22px] sm:p-[24px]">
          <CardHeading
            icon={Timer}
            title="Microgravity Countermeasure Log"
            right={
              <span className="rounded-full border border-dash-cyan/45 bg-dash-blue/25 px-[12px] py-[3px] text-[13px] font-medium text-dash-ice tabular-nums">
                {completedCount}/{sessions.length} Done
              </span>
            }
          />
          <p className="mt-[6px] text-[14.5px] text-dash-muted">
            Track daily ARED resistance and aerobic sessions to prevent bone and muscle loss.
          </p>

          <div className="mt-[16px] flex flex-col gap-[10px]">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center justify-between gap-[12px] rounded-[16px] border px-[14px] py-[12px] transition-colors",
                  s.completed
                    ? "border-dash-green/45 bg-dash-green/10"
                    : "border-dash-line bg-white/[0.03] hover:bg-dash-cyan/[0.06]",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleSession(s.id)}
                  className="flex min-w-0 flex-1 items-center gap-[12px] text-left"
                >
                  <span
                    className={cn(
                      "flex size-[24px] shrink-0 items-center justify-center rounded-[7px] border transition-colors",
                      s.completed
                        ? "border-dash-green bg-dash-green text-onb-ink"
                        : "border-dash-card-border bg-transparent",
                    )}
                  >
                    {s.completed && <Check className="size-[15px]" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "truncate text-[15.5px] font-semibold",
                        s.completed ? "text-foreground/75 line-through" : "text-foreground",
                      )}
                    >
                      {s.name}
                    </p>
                    <p className="text-[13px] text-dash-muted">
                      {s.focus} · {s.durationMin} min
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => removeSession(s.id)}
                  aria-label={`Remove ${s.name}`}
                  className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-dash-muted transition-colors hover:bg-white/[0.08] hover:text-coral"
                >
                  <Trash2 className="size-[16px]" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Exercise Form */}
          <form onSubmit={handleAdd} className="mt-auto pt-[18px]">
            <div className="grid grid-cols-1 gap-[10px] rounded-[18px] border border-dash-line bg-white/[0.03] p-[14px] sm:grid-cols-[1.5fr_0.7fr_0.9fr_auto]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Add exercise (e.g. Resistance Bands)"
                aria-label="Exercise name"
                className="dash-input h-[44px] px-[14px] text-[14.5px]"
              />
              <input
                type="number"
                min={5}
                max={180}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                aria-label="Duration in minutes"
                className="dash-input h-[44px] px-[12px] text-[14.5px] tabular-nums"
              />
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                aria-label="Exercise focus"
                className="dash-input h-[44px] px-[12px] text-[14.5px]"
              >
                <option value="Resistance">Resistance</option>
                <option value="Cardio">Cardio</option>
                <option value="Mobility">Mobility</option>
                <option value="Core">Core</option>
              </select>
              <button type="submit" className={DASH_BTN}>
                <Plus className="size-[17px]" />
                Add
              </button>
            </div>
          </form>
        </DashCard>
      </div>
    </div>
  );
}
