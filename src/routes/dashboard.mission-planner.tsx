import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Pencil,
  Plus,
  Rocket,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { CardHeading, DASH_BTN, DASH_GHOST, DashCard, PageHeader } from "@/components/dashboard/ui";
import { stepHead } from "@/components/onboarding/steps";
import {
  isAuthIssue,
  plannerApi,
  type MissionCategory,
  type MissionInput,
  type MissionPriority,
  type MissionStatus,
  type PlannerMission,
} from "@/lib/manage-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/mission-planner")({
  head: () =>
    stepHead(
      "Mission Planner",
      "Orbital daily schedule for vital checks, countermeasure exercise, nutrition, and rest.",
    ),
  component: MissionPlannerPage,
});

const CATEGORIES: MissionCategory[] = ["Vital Check", "Exercise", "Nutrition", "EVA Prep", "Rest"];
const PRIORITIES: MissionPriority[] = ["low", "medium", "high"];
const STATUSES: MissionStatus[] = ["pending", "in_progress", "done"];

const CATEGORY_STYLE: Record<MissionCategory, string> = {
  "Vital Check": "border-dash-cyan/45 bg-dash-cyan/15 text-dash-ice",
  Exercise: "border-dash-green/45 bg-dash-green/15 text-dash-green",
  Nutrition: "border-dash-amber/45 bg-dash-amber/15 text-dash-amber",
  "EVA Prep": "border-coral/45 bg-coral/15 text-coral",
  Rest: "border-dash-blue/50 bg-dash-blue/20 text-dash-ice",
};

const PRIORITY_STYLE: Record<MissionPriority, string> = {
  low: "border-dash-line text-dash-muted",
  medium: "border-dash-cyan/40 text-dash-ice",
  high: "border-coral/50 text-coral",
};

const STATUS_LABEL: Record<MissionStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

function MissionPlannerPage() {
  const [missions, setMissions] = useState<PlannerMission[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const [title, setTitle] = useState("");
  const [timeUtc, setTimeUtc] = useState("16:00 UTC");
  const [category, setCategory] = useState<MissionCategory>("Vital Check");
  const [priority, setPriority] = useState<MissionPriority>("medium");
  const [duration, setDuration] = useState("");

  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MissionInput>({ title: "" });

  useEffect(() => {
    let alive = true;
    plannerApi
      .list()
      .then((rows) => alive && (setMissions(rows), setLoadError(null)))
      .catch((err: unknown) => {
        if (!alive) return;
        setMissions([]);
        setLoadError(
          isAuthIssue(err)
            ? "Sign in to save your mission plan — changes won't persist without it."
            : "Could not load your mission plan. Check the backend connection.",
        );
      });
    return () => {
      alive = false;
    };
  }, []);

  const rows = missions ?? [];
  const isDone = (m: PlannerMission) => m.status === "done";
  const doneCount = rows.filter(isDone).length;
  const pct = rows.length ? Math.round((doneCount / rows.length) * 100) : 0;

  const visible = rows.filter((m) =>
    filter === "all" ? true : filter === "done" ? isDone(m) : !isDone(m),
  );

  const runAction = async (fn: () => Promise<void>, fail: string) => {
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(isAuthIssue(err) ? "Please sign in to save changes." : fail);
    }
  };

  const replace = (m: PlannerMission) =>
    setMissions((prev) => (prev ?? []).map((x) => (x.id === m.id ? m : x)));

  const toggleDone = (m: PlannerMission) =>
    runAction(async () => {
      replace(await plannerApi.patch(m.id, { status: isDone(m) ? "pending" : "done" }));
    }, "Could not update that task.");

  const removeTask = (m: PlannerMission) =>
    runAction(async () => {
      await plannerApi.remove(m.id);
      setMissions((prev) => (prev ?? []).filter((x) => x.id !== m.id));
      setOpenDetailsId((id) => (id === m.id ? null : id));
      setEditingId((id) => (id === m.id ? null : id));
    }, "Could not delete that task.");

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    runAction(async () => {
      const created = await plannerApi.create({
        title: trimmed,
        timeUtc: timeUtc.trim() || "12:00 UTC",
        category,
        priority,
        durationMin: duration ? Math.max(1, Math.min(1440, Number(duration))) : null,
      });
      setMissions((prev) => [...(prev ?? []), created].sort(bySchedule));
      setTitle("");
    }, "Could not add that task.");
  };

  const startEdit = (m: PlannerMission) => {
    setEditingId(m.id);
    setOpenDetailsId(m.id);
    setDraft({
      title: m.title,
      description: m.description,
      category: m.category,
      timeUtc: m.timeUtc,
      scheduledDay: m.scheduledDay,
      durationMin: m.durationMin,
      priority: m.priority,
      status: m.status,
    });
  };

  const saveEdit = (m: PlannerMission) =>
    runAction(async () => {
      const payload: MissionInput = { ...draft, title: (draft.title ?? "").trim() || m.title };
      replace(await plannerApi.patch(m.id, payload));
      setEditingId(null);
      setMissions((prev) => (prev ?? []).slice().sort(bySchedule));
    }, "Could not save those changes.");

  return (
    <div className="flex w-full flex-col gap-[20px]">
      <PageHeader
        title="Mission Planner"
        subtitle="Organize daily vital checks, exercise countermeasures, supplements, and EVA preparation. Everything here is saved to your account."
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
            {missions === null
              ? "Loading your plan…"
              : `${doneCount} of ${rows.length} scheduled mission blocks completed`}
          </p>
        </DashCard>

        <DashCard className="flex flex-col justify-between p-[22px] sm:p-[24px]">
          <CardHeading icon={Clock} title="Schedule Filters" />
          <div className="mt-[14px] flex flex-wrap gap-[10px]">
            {(
              [
                { id: "all", label: `All (${rows.length})` },
                { id: "pending", label: `Pending (${rows.length - doneCount})` },
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

      {(loadError || actionError) && (
        <p className="rounded-[12px] border border-coral/45 bg-coral/12 px-[16px] py-[10px] text-[14px] text-coral">
          {actionError ?? loadError}
        </p>
      )}

      {/* Add Task Bar */}
      <DashCard className="p-[18px] sm:p-[22px]">
        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 gap-[12px] md:grid-cols-2 xl:grid-cols-[1.6fr_0.85fr_0.95fr_0.7fr_0.65fr_auto]"
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
            onChange={(e) => setCategory(e.target.value as MissionCategory)}
            aria-label="Task category"
            className="dash-input h-[46px] px-[14px] text-[15px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as MissionPriority)}
            aria-label="Task priority"
            className="dash-input h-[46px] px-[14px] text-[15px]"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={1440}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="min"
            aria-label="Duration in minutes (optional)"
            className="dash-input h-[46px] px-[14px] text-[15px] tabular-nums"
          />
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
          {missions === null ? (
            <p className="rounded-[16px] border border-dashed border-dash-line py-[28px] text-center text-[15px] text-dash-muted">
              Loading your plan…
            </p>
          ) : visible.length === 0 ? (
            <p className="rounded-[16px] border border-dashed border-dash-line py-[28px] text-center text-[15px] text-dash-muted">
              {rows.length === 0
                ? "No missions yet. Add your first task above — it will be saved to your account."
                : "No mission tasks match this filter."}
            </p>
          ) : (
            visible.map((task) => {
              const done = isDone(task);
              const editing = editingId === task.id;
              const open = openDetailsId === task.id;
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex flex-col gap-[10px] rounded-[16px] border px-[16px] py-[14px] transition-colors",
                    done
                      ? "border-dash-green/40 bg-dash-green/10"
                      : "border-dash-line bg-white/[0.03] hover:bg-dash-cyan/[0.06]",
                  )}
                >
                  <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => toggleDone(task)}
                      className="flex min-w-0 flex-1 items-center gap-[14px] text-left"
                    >
                      <span
                        className={cn(
                          "flex size-[24px] shrink-0 items-center justify-center rounded-[7px] border transition-colors",
                          done
                            ? "border-dash-green bg-dash-green text-onb-ink"
                            : "border-dash-card-border bg-transparent",
                        )}
                      >
                        {done && <Check className="size-[15px]" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate text-[16px] font-semibold",
                            done ? "text-foreground/70 line-through" : "text-foreground",
                          )}
                        >
                          {task.title}
                        </p>
                        <p className="mt-[2px] text-[13px] tabular-nums text-dash-muted">
                          {task.timeUtc}
                          {task.scheduledDay ? ` · ${task.scheduledDay}` : ""}
                          {task.durationMin ? ` · ${task.durationMin} min` : ""}
                          {task.status === "in_progress" ? " · in progress" : ""}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center justify-between gap-[8px] sm:justify-end">
                      <span
                        className={cn(
                          "rounded-full border px-[12px] py-[3px] text-[12.5px] font-semibold",
                          CATEGORY_STYLE[task.category],
                        )}
                      >
                        {task.category}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-[10px] py-[3px] text-[12px] font-semibold capitalize",
                          PRIORITY_STYLE[task.priority],
                        )}
                      >
                        {task.priority}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (open) {
                            setEditingId(null);
                            setOpenDetailsId(null);
                          } else {
                            startEdit(task);
                          }
                        }}
                        aria-label={`Edit ${task.title}`}
                        className="flex size-[36px] items-center justify-center rounded-full text-dash-muted transition-colors hover:bg-white/[0.08] hover:text-dash-ice"
                      >
                        {open && editing ? (
                          <ChevronUp className="size-[16px]" />
                        ) : (
                          <ChevronDown className="size-[16px]" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTask(task)}
                        aria-label={`Delete ${task.title}`}
                        className="flex size-[36px] items-center justify-center rounded-full text-dash-muted transition-colors hover:bg-white/[0.08] hover:text-coral"
                      >
                        <Trash2 className="size-[17px]" />
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="grid grid-cols-1 gap-[10px] rounded-[14px] border border-dash-line bg-white/[0.03] p-[12px] md:grid-cols-2">
                      <input
                        type="text"
                        value={draft.title ?? ""}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        aria-label="Task title"
                        className="dash-input h-[42px] px-[12px] text-[14px] md:col-span-2"
                      />
                      <input
                        type="text"
                        value={draft.timeUtc ?? ""}
                        onChange={(e) => setDraft({ ...draft, timeUtc: e.target.value })}
                        placeholder="16:00 UTC"
                        aria-label="Scheduled UTC time"
                        className="dash-input h-[42px] px-[12px] text-[14px] tabular-nums"
                      />
                      <input
                        type="date"
                        value={draft.scheduledDay ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, scheduledDay: e.target.value || null })
                        }
                        aria-label="Scheduled day"
                        className="dash-input h-[42px] px-[12px] text-[14px]"
                      />
                      <select
                        value={draft.category ?? "Vital Check"}
                        onChange={(e) =>
                          setDraft({ ...draft, category: e.target.value as MissionCategory })
                        }
                        aria-label="Task category"
                        className="dash-input h-[42px] px-[12px] text-[14px]"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <select
                        value={draft.priority ?? "medium"}
                        onChange={(e) =>
                          setDraft({ ...draft, priority: e.target.value as MissionPriority })
                        }
                        aria-label="Task priority"
                        className="dash-input h-[42px] px-[12px] text-[14px]"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <select
                        value={draft.status ?? "pending"}
                        onChange={(e) =>
                          setDraft({ ...draft, status: e.target.value as MissionStatus })
                        }
                        aria-label="Task status"
                        className="dash-input h-[42px] px-[12px] text-[14px]"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {STATUS_LABEL[st]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={1440}
                        value={draft.durationMin ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            durationMin: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="Duration (min)"
                        aria-label="Duration in minutes"
                        className="dash-input h-[42px] px-[12px] text-[14px] tabular-nums"
                      />
                      <textarea
                        value={draft.description ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, description: e.target.value || null })
                        }
                        placeholder="Description / details (optional)"
                        aria-label="Task description"
                        rows={2}
                        className="dash-input min-h-[42px] px-[12px] py-[10px] text-[14px] md:col-span-2"
                      />
                      <div className="flex gap-[10px] md:col-span-2">
                        <button type="button" className={DASH_BTN} onClick={() => saveEdit(task)}>
                          <Check className="size-[16px]" />
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className={cn(DASH_GHOST, "border-dash-card-border")}
                          onClick={() => {
                            setEditingId(null);
                            setOpenDetailsId(null);
                          }}
                        >
                          <X className="size-[15px]" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DashCard>
    </div>
  );
}

/** Same ordering the API uses: scheduled day first, then UTC time string. */
function bySchedule(a: PlannerMission, b: PlannerMission): number {
  const da = a.scheduledDay ?? "9999-12-31";
  const db = b.scheduledDay ?? "9999-12-31";
  if (da !== db) return da < db ? -1 : 1;
  if (a.timeUtc !== b.timeUtc) return a.timeUtc < b.timeUtc ? -1 : 1;
  return a.createdAt < b.createdAt ? -1 : 1;
}
