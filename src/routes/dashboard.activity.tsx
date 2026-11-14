import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Flame,
  Pencil,
  Plus,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { WeeklyActivityBars } from "@/components/dashboard/charts";
import {
  BONE_LABEL,
  EMG_LABEL,
  WEEKLY_ACTIVITY_BARS,
  WEEKLY_ACTIVITY_TOTAL,
} from "@/components/dashboard/health";
import { RunnerIcon } from "@/components/dashboard/icons";
import { guidanceFor } from "@/components/dashboard/exercise-guidance";
import {
  CardHeading,
  DASH_BTN,
  DASH_GHOST,
  DashCard,
  InfoRow,
  PageHeader,
} from "@/components/dashboard/ui";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { stepHead } from "@/components/onboarding/steps";
import { isAuthIssue, workoutApi, type SessionInput, type WorkoutSession } from "@/lib/manage-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/activity")({
  head: () =>
    stepHead(
      "Activity",
      "Weekly exercise volume, muscle/bone profile, and microgravity countermeasure log.",
    ),
  component: ActivityPage,
});

const FOCUS_OPTIONS = ["Resistance", "Cardio", "Mobility", "Core"] as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function ActivityPage() {
  const { data } = useOnboarding();
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [duration, setDuration] = useState("25");
  const [focus, setFocus] = useState<(typeof FOCUS_OPTIONS)[number]>("Resistance");
  const [day, setDay] = useState(todayIso());
  const [notes, setNotes] = useState("");

  const [openGuidanceId, setOpenGuidanceId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SessionInput>({ name: "", durationMin: 25 });

  useEffect(() => {
    let alive = true;
    workoutApi
      .list()
      .then((rows) => alive && (setSessions(rows), setLoadError(null)))
      .catch((err: unknown) => {
        if (!alive) return;
        setSessions([]);
        setLoadError(
          isAuthIssue(err)
            ? "Sign in to save your training log — changes won't persist without it."
            : "Could not load your training log. Check the backend connection.",
        );
      });
    return () => {
      alive = false;
    };
  }, []);

  const rows = sessions ?? [];
  const completedCount = rows.filter((s) => s.completed).length;
  const totalLoggedMin = rows.reduce((sum, s) => sum + (s.completed ? s.durationMin : 0), 0);

  const runAction = async (fn: () => Promise<void>, fail: string) => {
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(isAuthIssue(err) ? "Please sign in to save changes." : fail);
    }
  };

  const toggleSession = (s: WorkoutSession) =>
    runAction(async () => {
      const next = await workoutApi.patch(s.id, { completed: !s.completed });
      setSessions((prev) => (prev ?? []).map((x) => (x.id === s.id ? next : x)));
    }, "Could not update that session.");

  const removeSession = (s: WorkoutSession) =>
    runAction(async () => {
      await workoutApi.remove(s.id);
      setSessions((prev) => (prev ?? []).filter((x) => x.id !== s.id));
      setOpenGuidanceId((id) => (id === s.id ? null : id));
      setEditingId((id) => (id === s.id ? null : id));
    }, "Could not delete that session.");

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const mins = Math.max(1, Math.min(600, Number(duration) || 25));
    runAction(async () => {
      const created = await workoutApi.create({
        name: trimmed,
        durationMin: mins,
        focus,
        sessionDay: day || todayIso(),
        notes: notes.trim() || null,
      });
      setSessions((prev) => [created, ...(prev ?? [])].sort(byDayDesc));
      setName("");
      setNotes("");
    }, "Could not add that exercise.");
  };

  const startEdit = (s: WorkoutSession) => {
    setEditingId(s.id);
    setOpenGuidanceId(null);
    setDraft({
      name: s.name,
      focus: s.focus,
      durationMin: s.durationMin,
      sessionDay: s.sessionDay,
      notes: s.notes,
    });
  };

  const saveEdit = (s: WorkoutSession) =>
    runAction(async () => {
      const next = await workoutApi.patch(s.id, draft);
      setSessions((prev) => (prev ?? []).map((x) => (x.id === s.id ? next : x)));
      setEditingId(null);
    }, "Could not save those changes.");

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
          <CardHeading icon={Timer} title="Completed Sessions" />
          <div className="mt-[14px] flex items-baseline gap-[8px]">
            <span className="text-[36px] leading-[40px] font-bold tabular-nums text-foreground">
              {totalLoggedMin}
            </span>
            <span className="text-[16px] font-medium text-dash-ice">min</span>
          </div>
          <p className="mt-[8px] text-[13.5px] text-dash-muted">
            {sessions === null
              ? "Loading your log…"
              : `${completedCount} of ${rows.length} sessions checked`}
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
                {completedCount}/{rows.length} Done
              </span>
            }
          />
          <p className="mt-[6px] text-[14.5px] text-dash-muted">
            Track daily ARED resistance and aerobic sessions to prevent bone and muscle loss.
          </p>

          {(loadError || actionError) && (
            <p className="mt-[10px] rounded-[12px] border border-coral/45 bg-coral/12 px-[14px] py-[8px] text-[13.5px] text-coral">
              {actionError ?? loadError}
            </p>
          )}

          <div className="mt-[16px] flex flex-col gap-[10px]">
            {sessions === null ? (
              <p className="rounded-[16px] border border-dashed border-dash-line py-[28px] text-center text-[15px] text-dash-muted">
                Loading your training log…
              </p>
            ) : rows.length === 0 ? (
              <p className="rounded-[16px] border border-dashed border-dash-line py-[28px] text-center text-[15px] text-dash-muted">
                No sessions logged yet. Add your first countermeasure below — it will be saved to
                your account.
              </p>
            ) : (
              rows.map((s) => {
                const guidance = guidanceFor(s);
                const open = openGuidanceId === s.id;
                const editing = editingId === s.id;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "flex flex-col gap-[10px] rounded-[16px] border px-[14px] py-[12px] transition-colors",
                      s.completed
                        ? "border-dash-green/45 bg-dash-green/10"
                        : "border-dash-line bg-white/[0.03] hover:bg-dash-cyan/[0.06]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-[12px]">
                      <button
                        type="button"
                        onClick={() => toggleSession(s)}
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
                            {s.sessionDay ? ` · ${s.sessionDay}` : ""}
                            {s.notes ? ` · ${s.notes}` : ""}
                          </p>
                        </div>
                      </button>

                      <div className="flex shrink-0 items-center gap-[4px]">
                        <button
                          type="button"
                          onClick={() => setOpenGuidanceId(open ? null : s.id)}
                          aria-label={
                            open ? `Hide guidance for ${s.name}` : `Why ${s.name} matters`
                          }
                          className="flex size-[34px] items-center justify-center rounded-full text-dash-muted transition-colors hover:bg-white/[0.08] hover:text-dash-ice"
                        >
                          {open ? (
                            <ChevronUp className="size-[16px]" />
                          ) : (
                            <ChevronDown className="size-[16px]" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => (editing ? setEditingId(null) : startEdit(s))}
                          aria-label={`Edit ${s.name}`}
                          className="flex size-[34px] items-center justify-center rounded-full text-dash-muted transition-colors hover:bg-white/[0.08] hover:text-dash-ice"
                        >
                          {editing ? (
                            <X className="size-[16px]" />
                          ) : (
                            <Pencil className="size-[15px]" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSession(s)}
                          aria-label={`Remove ${s.name}`}
                          className="flex size-[34px] items-center justify-center rounded-full text-dash-muted transition-colors hover:bg-white/[0.08] hover:text-coral"
                        >
                          <Trash2 className="size-[16px]" />
                        </button>
                      </div>
                    </div>

                    {editing && (
                      <div className="grid grid-cols-1 gap-[10px] rounded-[14px] border border-dash-line bg-white/[0.03] p-[12px] sm:grid-cols-2">
                        <input
                          type="text"
                          value={draft.name}
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          aria-label="Exercise name"
                          className="dash-input h-[42px] px-[12px] text-[14px]"
                        />
                        <div className="flex gap-[10px]">
                          <input
                            type="number"
                            min={1}
                            max={600}
                            value={draft.durationMin ?? 25}
                            onChange={(e) =>
                              setDraft({ ...draft, durationMin: Number(e.target.value) || 0 })
                            }
                            aria-label="Duration in minutes"
                            className="dash-input h-[42px] w-1/2 px-[12px] text-[14px] tabular-nums"
                          />
                          <select
                            value={draft.focus ?? "Resistance"}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                focus: e.target.value as (typeof FOCUS_OPTIONS)[number],
                              })
                            }
                            aria-label="Exercise focus"
                            className="dash-input h-[42px] w-1/2 px-[10px] text-[14px]"
                          >
                            {FOCUS_OPTIONS.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="date"
                          value={draft.sessionDay ?? ""}
                          onChange={(e) =>
                            setDraft({ ...draft, sessionDay: e.target.value || null })
                          }
                          aria-label="Session date"
                          className="dash-input h-[42px] px-[12px] text-[14px]"
                        />
                        <input
                          type="text"
                          value={draft.notes ?? ""}
                          onChange={(e) => setDraft({ ...draft, notes: e.target.value || null })}
                          placeholder="Notes (optional)"
                          aria-label="Session notes"
                          className="dash-input h-[42px] px-[12px] text-[14px]"
                        />
                        <div className="flex gap-[10px] sm:col-span-2">
                          <button type="button" className={DASH_BTN} onClick={() => saveEdit(s)}>
                            <Check className="size-[16px]" />
                            Save
                          </button>
                          <button
                            type="button"
                            className={cn(DASH_GHOST, "border-dash-card-border")}
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {open && (
                      <div className="flex flex-col gap-[10px] rounded-[14px] border border-dash-line bg-white/[0.03] p-[14px]">
                        <div className="rounded-[12px] border border-dash-green/35 bg-dash-green/10 px-[12px] py-[10px]">
                          <p className="text-[12.5px] font-bold tracking-[0.06em] text-dash-green uppercase">
                            If you do this exercise
                          </p>
                          <p className="mt-[4px] text-[13.5px] leading-[19px] text-foreground/90">
                            {guidance.benefits}
                          </p>
                          <p className="mt-[6px] text-[12.5px] text-dash-muted">
                            Supports: {guidance.supports.join(" · ")}
                          </p>
                        </div>
                        <div className="rounded-[12px] border border-dash-amber/40 bg-dash-amber/10 px-[12px] py-[10px]">
                          <p className="text-[12.5px] font-bold tracking-[0.06em] text-dash-amber uppercase">
                            If you consistently skip it
                          </p>
                          <p className="mt-[4px] text-[13.5px] leading-[19px] text-foreground/90">
                            {guidance.consequences}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-[8px] text-[12px] text-dash-muted">
                          <span>Sources:</span>
                          {guidance.references.map((r) => (
                            <a
                              key={r.url}
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-dash-line px-[10px] py-[2px] text-dash-ice transition-colors hover:border-dash-cyan"
                            >
                              {r.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Add Exercise Form */}
          <form onSubmit={handleAdd} className="mt-auto pt-[18px]">
            <div className="grid grid-cols-1 gap-[10px] rounded-[18px] border border-dash-line bg-white/[0.03] p-[14px] lg:grid-cols-[1.4fr_0.6fr_0.9fr_0.9fr_1fr_auto]">
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
                min={1}
                max={600}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                aria-label="Duration in minutes"
                className="dash-input h-[44px] px-[12px] text-[14.5px] tabular-nums"
              />
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value as (typeof FOCUS_OPTIONS)[number])}
                aria-label="Exercise focus"
                className="dash-input h-[44px] px-[12px] text-[14.5px]"
              >
                {FOCUS_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                aria-label="Session date"
                className="dash-input h-[44px] px-[12px] text-[14.5px]"
              />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                aria-label="Session notes"
                className="dash-input h-[44px] px-[14px] text-[14.5px]"
              />
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

/** Newest day first; rows without a day keep creation order. */
function byDayDesc(a: WorkoutSession, b: WorkoutSession): number {
  const da = a.sessionDay ?? "";
  const db = b.sessionDay ?? "";
  if (da !== db) return da < db ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : -1;
}
