export interface PhysicalExercise {
  id: "palm-press" | "arm-curl" | "core-contraction" | (string & {});
  name: string;
  durationSec: number;
  category: string;
  targetMuscles: string;
  cue: string;
  inTodaysMission: boolean;
}

/**
 * Mission launch date used to compute live Mission Day counts relative to the current date.
 * Calibrated so Nov 13, 2026 corresponds to Mission Day 42 (matching mission telemetry).
 */
export const MISSION_START_ISO = "2026-10-03";

export function getMissionDayAndDate(now: Date = new Date()): {
  missionDay: number;
  formattedDate: string;
} {
  const [yearStr, monthStr, dayStr] = MISSION_START_ISO.split("-");
  const startUtc = Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((todayUtc - startUtc) / 86_400_000) + 1;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);

  return {
    missionDay: Math.max(1, diffDays),
    formattedDate,
  };
}

export const PHYSICAL_ACTIVITY_STATS = {
  progressPercent: 78,
  todayMinutes: 25,
  todayGoalMinutes: 45,
  weeklyCompletedDays: 5,
  weeklyTotalDays: 7,
  weeklyDotCount: 6,
};

export const TODAY_EXERCISES: readonly PhysicalExercise[] = [
  {
    id: "palm-press",
    name: "Palm Press",
    durationSec: 30,
    category: "Isometric Upper Body",
    targetMuscles: "Chest, Shoulders & Forearms",
    cue: "Press both palms firmly together at chest height while keeping your shoulders relaxed and core braced.",
    inTodaysMission: true,
  },
  {
    id: "arm-curl",
    name: "Self-Resistance Arm Curl",
    durationSec: 30,
    category: "Self-Resistance",
    targetMuscles: "Biceps, Triceps & Stabilizers",
    cue: "Use one arm to apply steady downward resistance while curling the opposite arm smoothly upward.",
    inTodaysMission: true,
  },
  {
    id: "core-contraction",
    name: "Core Contraction",
    durationSec: 30,
    category: "Microgravity Core",
    targetMuscles: "Abdominals & Hip Flexors",
    cue: "Draw ribs toward knees in a slow, controlled contraction to stabilize spinal posture in zero-G.",
    inTodaysMission: true,
  },
];

export const ALL_MICROGRAVITY_EXERCISES: readonly PhysicalExercise[] = [
  ...TODAY_EXERCISES,
  {
    id: "calf-raise",
    name: "Foot-Loop Calf Raise",
    durationSec: 45,
    category: "Lower Limb Countermeasure",
    targetMuscles: "Calves & Achilles Tendon",
    cue: "Anchor feet into deck restraints and press onto toes smoothly for lower-limb bone loading.",
    inTodaysMission: false,
  },
  {
    id: "scapular-squeeze",
    name: "Orbital Scapular Squeeze",
    durationSec: 30,
    category: "Postural Mobility",
    targetMuscles: "Upper Back & Rhomboids",
    cue: "Pull shoulder blades gently back and down, holding each squeeze for two seconds.",
    inTodaysMission: false,
  },
  {
    id: "neck-glide",
    name: "Cervical Alignment Hold",
    durationSec: 30,
    category: "Mobility & Balance",
    targetMuscles: "Deep Neck Flexors",
    cue: "Tuck chin slightly back to counter microgravity forward-head drift.",
    inTodaysMission: false,
  },
];
