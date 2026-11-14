import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, Clock, Plus, RotateCcw, Rocket, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { CardHeading, DASH_BTN, DASH_GHOST, DashCard, PageHeader } from "@/components/dashboard/ui";
import { PLANNER_KEY, useStoredState } from "@/components/dashboard/use-stored-state";
import { stepHead } from "@/components/onboarding/steps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/mission-planner")({
  head: () =>
    stepHead(
      "Mission Planner",
      "Orbital daily schedule for vital checks, countermeasure exercise, nutrition, and rest.",
    ),
  component: MissionPlannerPage,
});

type TaskCategory = "Vital Check" | "Exercise" | "Nutrition" | "EVA Prep" | "Rest";

interface MissionTask {
  id: string;
  title: string;
  timeUtc: string;
  category: TaskCategory;
  done: boolean;
}

const DEFAULT_TASKS: MissionTask[] = [
  {
    id: "m1",
    title: "Morning SpO₂ & Resting HR Check",
    timeUtc: "06:30 UTC",
    category: "Vital Check",
    done: true,
  },
  {
    id: "m2",
    title: "Vitamin D3 & Iron Supplementation",
    timeUtc: "07:15 UTC",
    category: "Nutrition",
    done: true,
  },
  {
    id: "m3",
    title: "ARED Strength Training Block",
    timeUtc: "10:00 UTC",
    category: "Exercise",
    done: false,
  },
  {
    id: "m4",
    title: "EVA Suit Seal & Comms Check",
    timeUtc: "14:00 UTC",
    category: "EVA Prep",
    done: false,
  },
  {
    id: "m5",
    title: "Evening Core Body Temp Log",
    timeUtc: "19:00 UTC",
    category: "Vital Check",
    done: false,
  },
  {
    id: "m6",
    title: "Pre-Sleep Recovery & Hydration Wind-Down",
    timeUtc: "21:30 UTC",
    category: "Rest",
    done: false,
  },
];

const CATEGORY_STYLE: Record<TaskCategory, string> = {
  "Vital Check": "border-dash-cyan/45 bg-dash-cyan/15 text-dash-ice",
  Exercise: "border-dash-green/45 bg-dash-green/15 text-dash-green",
  Nutrition: "border-dash-amber/45 bg-dash-amber/15 text-dash-amber",
  "EVA Prep": "border-coral/45 bg-coral/15 text-coral",
  Rest: "border-dash-blue/50 bg-dash-blue/20 text-dash-ice",
};

function MissionPlannerPage() {
  const [tasks, setTasks] = useStoredState<MissionTask[]>(PLANNER_KEY, DEFAULT_TASKS);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [title, setTitle] = useState("");
  const [timeUtc, setTimeUtc] = useState("16:00 UTC");
  const [category, setCategory] = useState<TaskCategory>("Vital Check");

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const visibleTasks = tasks.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done,
  );

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}`,
        title: trimmed,
        timeUtc: timeUtc.trim() || "12:00 UTC",
        category,
        done: false,
      },
    ]);
    setTitle("");
  };

  return (
    <div className="flex w-full flex-col gap-[20px]">
      <PageHeader
        title="Mission Planner"
        subtitle="Organize daily vital checks, exercise countermeasures, supplements, and EVA preparation."
        actions={
          <button type="button" onClick={() => setTasks(DEFAULT_TASKS)} className={DASH_GHOST}>
            <RotateCcw className="size-[16px]" />
            Reset Schedule
          </button>
        }
      />

      {/* Top Progress + Summary Row */}
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
        <DashCard className="flex flex-col justify-between p-[22px] sm:p-[24px]">
          <CardHeading
            icon={Rocket}
            title="Daily Mission Progress"
            right={
              <span className="text-[20px] font-bold tabular-nums text-dash-cyan">{pct}%</span>
            }
          />
          <div className="mt-[16px] h-[12px] w-full overflow-hidden rounded-full bg-dash-track">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8_0%,#00e5ff_100%)] shadow-[0_0_14px_var(--dash-cyan)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-[10px] text-[14px] text-dash-muted">
            {doneCount} of {tasks.length} scheduled mission blocks completed today
          </p>
        </DashCard>

        <DashCard className="flex flex-col justify-between p-[22px] sm:p-[24px]">
          <CardHeading icon={CalendarDays} title="Schedule Filters" />
          <div className="mt-[14px] flex flex-wrap gap-[10px]">
            {(
              [
                { id: "all", label: `All (${tasks.length})` },
                { id: "pending", label: `Pending (${tasks.length - doneCount})` },
                { id: "done", label: `Completed (${doneCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "h-[42px] rounded-full border px-[18px] text-[14px] font-semibold transition-colors",
                  filter === tab.id
                    ? "dash-nav-active border-dash-cyan text-foreground"
                    : "border-dash-card-border bg-white/[0.04] text-dash-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </DashCard>
      </div>

      {/* Add Task Bar */}
      <DashCard className="p-[18px] sm:p-[22px]">
        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 gap-[12px] md:grid-cols-[1.8fr_0.9fr_1fr_auto]"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a mission task (e.g. Cabin O₂ Calibration)"
            aria-label="Mission task title"
            className="dash-input h-[46px] px-[16px] text-[15px]"
          />
          <input
            type="text"
            value={timeUtc}
            onChange={(e) => setTimeUtc(e.target.value)}
            placeholder="16:00 UTC"
            aria-label="Scheduled UTC time"
            className="dash-input h-[46px] px-[16px] text-[15px] tabular-nums"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            aria-label="Task category"
            className="dash-input h-[46px] px-[14px] text-[15px]"
          >
            <option value="Vital Check">Vital Check</option>
            <option value="Exercise">Exercise</option>
            <option value="Nutrition">Nutrition</option>
            <option value="EVA Prep">EVA Prep</option>
            <option value="Rest">Rest</option>
          </select>
          <button type="submit" className={cn(DASH_BTN, "h-[46px]")}>
            <Plus className="size-[18px]" />
            Add Task
          </button>
        </form>
      </DashCard>

      {/* Task Timeline List */}
      <DashCard className="p-[18px] sm:p-[24px]">
        <CardHeading icon={Clock} title="Scheduled Timeline" />
        <div className="mt-[16px] flex flex-col gap-[10px]">
          {visibleTasks.length === 0 ? (
            <p className="rounded-[16px] border border-dashed border-dash-line py-[28px] text-center text-[15px] text-dash-muted">
              No mission tasks match this filter.
            </p>
          ) : (
            visibleTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex flex-col gap-[10px] rounded-[16px] border px-[16px] py-[14px] transition-colors sm:flex-row sm:items-center sm:justify-between",
                  task.done
                    ? "border-dash-green/40 bg-dash-green/10"
                    : "border-dash-line bg-white/[0.03] hover:bg-dash-cyan/[0.06]",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="flex min-w-0 flex-1 items-center gap-[14px] text-left"
                >
                  <span
                    className={cn(
                      "flex size-[24px] shrink-0 items-center justify-center rounded-[7px] border transition-colors",
                      task.done
                        ? "border-dash-green bg-dash-green text-onb-ink"
                        : "border-dash-card-border bg-transparent",
                    )}
                  >
                    {task.done && <Check className="size-[15px]" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "truncate text-[16px] font-semibold",
                        task.done ? "text-foreground/70 line-through" : "text-foreground",
                      )}
                    >
                      {task.title}
                    </p>
                    <p className="mt-[2px] text-[13px] tabular-nums text-dash-muted">
                      {task.timeUtc}
                    </p>
                  </div>
                </button>

                <div className="flex items-center justify-between gap-[10px] sm:justify-end">
                  <span
                    className={cn(
                      "rounded-full border px-[12px] py-[3px] text-[12.5px] font-semibold",
                      CATEGORY_STYLE[task.category],
                    )}
                  >
                    {task.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    className="flex size-[36px] items-center justify-center rounded-full text-dash-muted transition-colors hover:bg-white/[0.08] hover:text-coral"
                  >
                    <Trash2 className="size-[17px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DashCard>
    </div>
  );
}
