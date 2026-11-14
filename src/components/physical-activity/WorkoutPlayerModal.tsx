import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import spaceScene from "@/assets/dashboard/dashboard-earth-scene.jpg.asset.json";
import { ALL_MICROGRAVITY_EXERCISES, type PhysicalExercise } from "@/data/physicalActivityData";
import { cn } from "@/lib/utils";

import { ExerciseFigure } from "./ExerciseFigures";

interface WorkoutPlayerModalProps {
  open: boolean;
  exercises: readonly PhysicalExercise[];
  initialIndex?: number;
  completedIds: string[];
  onCompleteExercise: (id: string) => void;
  onClose: () => void;
}

export function WorkoutPlayerModal({
  open,
  exercises,
  initialIndex = 0,
  completedIds,
  onCompleteExercise,
  onClose,
}: WorkoutPlayerModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const current = exercises[index] ?? exercises[0];
  const [secondsLeft, setSecondsLeft] = useState(current?.durationSec ?? 30);
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!open) return;
    const startIdx = Math.max(0, Math.min(initialIndex, exercises.length - 1));
    setIndex(startIdx);
    setSecondsLeft(exercises[startIdx]?.durationSec ?? 30);
    setPlaying(true);
    setFinished(false);
  }, [open, initialIndex, exercises]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !playing || finished || !current) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onCompleteExercise(current.id);
          if (index < exercises.length - 1) {
            const nextIdx = index + 1;
            setIndex(nextIdx);
            return exercises[nextIdx]?.durationSec ?? 30;
          }
          setPlaying(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, playing, finished, current, index, exercises, onCompleteExercise]);

  if (!open || !current) return null;

  const totalSec = current.durationSec || 30;
  const ringSize = 112;
  const stroke = 7;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressFraction = Math.max(0, Math.min(1, (totalSec - secondsLeft) / totalSec));

  const goToExercise = (nextIdx: number) => {
    const clamped = Math.max(0, Math.min(nextIdx, exercises.length - 1));
    setIndex(clamped);
    setSecondsLeft(exercises[clamped]?.durationSec ?? 30);
    setFinished(false);
    setPlaying(true);
  };

  const handleCompleteAndNext = () => {
    onCompleteExercise(current.id);
    if (index < exercises.length - 1) {
      goToExercise(index + 1);
    } else {
      setPlaying(false);
      setFinished(true);
    }
  };

  const handleRestartAll = () => {
    setIndex(0);
    setSecondsLeft(exercises[0]?.durationSec ?? 30);
    setFinished(false);
    setPlaying(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Workout Player"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto bg-[#040c22]/90 px-[18px] py-[22px] backdrop-blur-xl sm:px-[32px] sm:py-[28px]"
    >
      <img
        src={spaceScene.url}
        alt=""
        aria-hidden
        className="pointer-events-none fixed inset-0 h-full w-full object-cover object-left-bottom opacity-35 select-none"
      />

      {/* Top header: counter, 3-segment progress bar, close button */}
      <div className="relative z-10 flex w-full max-w-[920px] flex-col gap-[14px]">
        <div className="flex items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[12px]">
            <span className="inline-flex items-center gap-[8px] rounded-full border border-[#FF8A65]/40 bg-[#F0734F]/15 px-[14px] py-[5px] text-[14.5px] font-semibold text-[#FF8A65]">
              <span className="size-[8px] rounded-full bg-[#FF8A65] shadow-[0_0_8px_#F0734F]" />
              {finished ? "Mission Complete" : `Exercise ${index + 1} of ${exercises.length}`}
            </span>
            {!finished && (
              <span className="hidden text-[14.5px] text-[#7FB8FF] sm:inline">
                {current.category}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close workout player"
            className="flex size-[44px] items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white transition-colors hover:border-[#7FB8FF] hover:bg-white/[0.16]"
          >
            <X className="size-[22px]" />
          </button>
        </div>

        {/* 3-segment progress bar */}
        <div aria-label="Workout progress" className="grid grid-cols-3 gap-[10px]">
          {exercises.map((ex, i) => {
            const isCompleted = completedIds.includes(ex.id) || finished || i < index;
            const isActive = !finished && i === index;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => goToExercise(i)}
                aria-label={`Jump to ${ex.name}`}
                className="group flex flex-col gap-[6px] text-left"
              >
                <div className="h-[8px] w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isCompleted
                        ? "w-full bg-gradient-to-r from-[#F0734F] to-[#FF8A65] shadow-[0_0_12px_rgba(240,115,79,0.6)]"
                        : isActive
                          ? "bg-gradient-to-r from-[#F0734F] to-[#FF8A65] shadow-[0_0_12px_rgba(240,115,79,0.55)]"
                          : "w-0",
                    )}
                    style={
                      isActive && !isCompleted
                        ? { width: `${Math.max(12, Math.round(progressFraction * 100))}%` }
                        : undefined
                    }
                  />
                </div>
                <span
                  className={cn(
                    "truncate text-[12.5px] transition-colors",
                    isActive
                      ? "font-semibold text-white"
                      : isCompleted
                        ? "text-[#FF8A65]"
                        : "text-white/55 group-hover:text-white/80",
                  )}
                >
                  {i + 1}. {ex.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center large glass card */}
      <div className="dash-card relative z-10 my-auto flex w-full max-w-[920px] flex-col items-center rounded-[28px] px-[24px] py-[28px] sm:px-[40px] sm:py-[36px]">
        {finished ? (
          <div className="flex max-w-[520px] flex-col items-center py-[24px] text-center">
            <span className="flex size-[78px] items-center justify-center rounded-full border border-[#FF8A65]/50 bg-gradient-to-br from-[#F0734F]/30 to-[#FF8A65]/15 text-[#FF8A65] shadow-[0_0_30px_rgba(240,115,79,0.45)]">
              <Sparkles className="size-[38px]" />
            </span>
            <h2 className="mt-[20px] text-[30px] font-bold text-white sm:text-[34px]">
              Today&apos;s Mission Complete!
            </h2>
            <p className="mt-[10px] text-[16px] leading-[24px] text-[#7FB8FF]">
              All 3 microgravity exercises completed. Consistent orbital training preserves bone
              density and muscle strength.
            </p>
            <div className="mt-[28px] flex flex-wrap items-center justify-center gap-[14px]">
              <button
                type="button"
                onClick={handleRestartAll}
                className="inline-flex h-[48px] items-center gap-[8px] rounded-[14px] border border-blue-300/35 bg-white/[0.06] px-[20px] text-[15.5px] font-medium text-white transition-colors hover:bg-white/[0.12]"
              >
                <RotateCcw className="size-[18px]" />
                Repeat Workout
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-[48px] items-center gap-[8px] rounded-[14px] bg-gradient-to-r from-[#F0734F] to-[#FF8A65] px-[24px] text-[16px] font-bold text-white shadow-[0_0_24px_rgba(240,115,79,0.55)] transition-transform hover:scale-[1.02]"
              >
                <Check className="size-[19px]" strokeWidth={2.6} />
                Back to Physical Activity
              </button>
            </div>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 items-center gap-[28px] md:grid-cols-[1.05fr_1fr]">
            {/* Animated exercise demonstration stage */}
            <div className="flex flex-col items-center justify-center rounded-[22px] border border-blue-400/30 bg-[#071842]/70 px-[20px] py-[28px] shadow-[inset_0_0_32px_rgba(79,163,255,0.16)]">
              <ExerciseFigure
                exerciseId={current.id}
                animated={playing}
                className="h-[190px] w-[240px] sm:h-[220px] sm:w-[270px]"
              />
              <span className="mt-[12px] inline-flex items-center gap-[7px] rounded-full border border-[#4FA3FF]/35 bg-[#4FA3FF]/12 px-[12px] py-[4px] text-[13px] font-medium text-[#7FB8FF]">
                <span
                  className={cn(
                    "size-[7px] rounded-full",
                    playing ? "animate-pulse bg-[#34d399]" : "bg-[#FF8A65]",
                  )}
                />
                {playing ? "Live Motion Guide" : "Paused"}
              </span>
            </div>

            {/* Exercise metadata + Countdown Ring + Controls */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <span className="text-[13.5px] font-semibold tracking-wide text-[#7FB8FF] uppercase">
                {current.targetMuscles}
              </span>
              <h2 className="mt-[6px] text-[28px] leading-[34px] font-bold text-white sm:text-[32px]">
                {current.name}
              </h2>
              <p className="mt-[10px] text-[15.5px] leading-[23px] text-white/80">{current.cue}</p>

              {/* Countdown Ring + Play/Pause */}
              <div className="mt-[22px] flex flex-wrap items-center justify-center gap-[20px] md:justify-start">
                <div
                  className="relative flex items-center justify-center"
                  style={{ width: ringSize, height: ringSize }}
                >
                  <svg width={ringSize} height={ringSize} className="-rotate-90">
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.14)"
                      strokeWidth={stroke}
                    />
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      fill="none"
                      stroke="#F0734F"
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      strokeDasharray={`${circumference * (1 - progressFraction)} ${circumference}`}
                      className="transition-[stroke-dasharray] duration-500"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[30px] leading-none font-bold tabular-nums text-white">
                      {secondsLeft}
                    </span>
                    <span className="mt-[2px] text-[12px] text-[#7FB8FF]">sec</span>
                  </div>
                </div>

                <div className="flex flex-col gap-[10px]">
                  <div className="flex items-center gap-[10px]">
                    <button
                      type="button"
                      onClick={() => setPlaying((p) => !p)}
                      className="inline-flex h-[48px] items-center gap-[10px] rounded-[15px] bg-gradient-to-r from-[#F0734F] to-[#FF8A65] px-[22px] text-[16px] font-bold text-white shadow-[0_0_20px_rgba(240,115,79,0.5)] transition-transform hover:scale-[1.02]"
                    >
                      {playing ? (
                        <>
                          <Pause className="size-[18px] fill-white" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="size-[18px] fill-white" />
                          Resume
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecondsLeft(totalSec)}
                      aria-label="Reset timer"
                      className="flex size-[48px] items-center justify-center rounded-[15px] border border-blue-300/35 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.14]"
                    >
                      <RotateCcw className="size-[18px]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-[8px]">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => goToExercise(index - 1)}
                      className="inline-flex h-[40px] items-center gap-[4px] rounded-[12px] border border-white/15 bg-white/[0.05] px-[14px] text-[14px] font-medium text-white transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="size-[16px]" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteAndNext}
                      className="inline-flex h-[40px] items-center gap-[6px] rounded-[12px] border border-[#4FA3FF]/45 bg-[#4FA3FF]/20 px-[16px] text-[14px] font-semibold text-white transition-colors hover:bg-[#4FA3FF]/35"
                    >
                      {index < exercises.length - 1 ? (
                        <>
                          Next Exercise
                          <ChevronRight className="size-[16px]" />
                        </>
                      ) : (
                        <>
                          <Check className="size-[16px]" />
                          Finish Workout
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 h-[8px]" />
    </div>
  );
}

export function AllExercisesModal({
  open,
  onClose,
  onStartWorkout,
}: {
  open: boolean;
  onClose: () => void;
  onStartWorkout: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="All Orbital Exercises"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040c22]/80 px-[16px] py-[24px] backdrop-blur-md"
    >
      <div className="dash-card relative flex max-h-[85vh] w-full max-w-[740px] flex-col rounded-[24px] p-[24px] sm:p-[28px]">
        <div className="flex items-center justify-between gap-[12px]">
          <div>
            <h2 className="text-[22px] font-bold text-white sm:text-[24px]">
              All Microgravity Exercises
            </h2>
            <p className="mt-[2px] text-[14.5px] text-[#7FB8FF]">
              Full orbital countermeasure library for muscle and bone preservation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close exercise list"
            className="flex size-[40px] items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.14]"
          >
            <X className="size-[20px]" />
          </button>
        </div>

        <div className="dash-scroll mt-[18px] grid grid-cols-1 gap-[12px] overflow-y-auto pr-[4px] sm:grid-cols-2">
          {ALL_MICROGRAVITY_EXERCISES.map((ex) => (
            <div
              key={ex.id}
              className="flex items-start gap-[14px] rounded-[18px] border border-blue-400/25 bg-[#0c2766]/55 p-[16px]"
            >
              <div className="flex size-[56px] shrink-0 items-center justify-center rounded-[14px] border border-[#4FA3FF]/30 bg-[#071842]/70 p-[6px]">
                <ExerciseFigure exerciseId={ex.id} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-[8px]">
                  <h3 className="truncate text-[16px] font-semibold text-white">{ex.name}</h3>
                  <span className="shrink-0 text-[13px] font-medium text-[#7FB8FF]">
                    • {ex.durationSec} sec
                  </span>
                </div>
                <p className="mt-[2px] text-[12.5px] text-[#FF8A65]">{ex.category}</p>
                <p className="mt-[6px] text-[13.5px] leading-[19px] text-white/75">{ex.cue}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[20px] flex justify-end gap-[12px] border-t border-white/10 pt-[16px]">
          <button
            type="button"
            onClick={onClose}
            className="h-[44px] rounded-[14px] border border-white/20 px-[18px] text-[15px] font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartWorkout();
            }}
            className="inline-flex h-[44px] items-center gap-[8px] rounded-[14px] bg-gradient-to-r from-[#F0734F] to-[#FF8A65] px-[20px] text-[15px] font-bold text-white shadow-[0_0_20px_rgba(240,115,79,0.45)]"
          >
            <Play className="size-[16px] fill-white" />
            Start Today&apos;s Workout
          </button>
        </div>
      </div>
    </div>
  );
}
