/**
 * Why each exercise matters — and what consistent skipping may cost.
 *
 * Claims are anchored to NASA Human Research Program pages and
 * NASA-STD-3001 countermeasure standards (see `references` per entry).
 * Deliberately measured language: no fear-based framing, and nothing
 * suggests a single missed session causes harm — the described effects
 * come from *consistently* missing a countermeasure over weeks.
 */

export interface ExerciseGuidance {
  benefits: string;
  consequences: string;
  supports: string[];
  references: { title: string; url: string }[];
}

const NASA_EXERCISE = {
  title: "NASA — Astronaut Exercise (ISS research)",
  url: "https://www.nasa.gov/missions/station/iss-research/astronaut-exercise/",
};
const NASA_BONE = {
  title: "NASA — Risk of Spaceflight-Induced Bone Changes",
  url: "https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/",
};
const NASA_FITNESS = {
  title: "NASA — Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness",
  url: "https://www.nasa.gov/reference/risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/",
};
const NASA_HUMAN_PERF = {
  title: "NASA-STD-3001 countermeasure standards (Human Performance 4.0)",
  url: "https://www.nasa.gov/reference/4-0-human-performance/",
};
const WHO_ACTIVITY = {
  title: "WHO guidelines on physical activity (2020)",
  url: "https://www.who.int/publications/i/item/9789240015128",
};

const GUIDANCE = {
  resistive: {
    benefits:
      "Heavy squats and deadlifts load the spine and hips the way gravity does on Earth. This is the primary defence against microgravity bone loss and keeps leg, hip and back strength at the level NASA's standards require — at least 80% of your pre-mission baseline — for EVAs, landings and unaided egress.",
    consequences:
      "Bones in microgravity lose density fastest at exactly these sites (hip and spine; untreated loss averages roughly 1–1.5% per month). If resistive sessions are consistently skipped, countermeasures can no longer offset that drift, and post-flight fracture risk and weakness rise over weeks — not after a single missed workout.",
    supports: ["Bone health", "Muscle strength", "Landing readiness"],
    references: [NASA_BONE, NASA_EXERCISE, NASA_HUMAN_PERF],
  },
  treadmill: {
    benefits:
      "Interval running combines impact loading (good for hip and spine bone) with a strong aerobic stimulus. It helps hold your in-mission VO₂max at the standard's fitness-for-duty level (≥32.9 mL/min/kg for microgravity EVAs) and supports heart, circulation and endurance.",
    consequences:
      "Without regular aerobic impact work, average detraining in orbit is 10–12% of pre-mission fitness, and cardiovascular readjustment can make standing and return-to-gravity transitions harder after landing. The effect accumulates over weeks of skipped sessions.",
    supports: ["Cardiovascular fitness", "Bone loading", "Endurance"],
    references: [NASA_FITNESS, NASA_EXERCISE, NASA_HUMAN_PERF],
  },
  cycle: {
    benefits:
      "Cycling on the ergometer raises heart rate and breathing without impact on joints — the sustainable cardio pillar of the daily 2.5-hour countermeasure block. It maintains aerobic capacity and legs' endurance while giving bone and connective tissue a low-impact day.",
    consequences:
      "Skipping the aerobic sessions lowers weekly cardio volume below what keeps VO₂max at the required in-mission floor; endurance and recovery capacity decline gradually, and every other session must then carry the full aerobic load.",
    supports: ["Cardiovascular fitness", "Endurance", "Joint-friendly load"],
    references: [NASA_EXERCISE, NASA_HUMAN_PERF, WHO_ACTIVITY],
  },
  core: {
    benefits:
      "Core and postural work retrains the deep stabilizers that no longer fight gravity in orbit. It protects spinal alignment, supports balanced fluid shifts and keeps the trunk strength you need for suit donning, tethers and translation tasks.",
    consequences:
      "When postural muscles decondition, back discomfort, reduced trunk control and slower readaptation to gravity become more likely at landing and during lunar or Martian transitions. This follows sustained omission, not occasional rest days.",
    supports: ["Postural stability", "Spine health", "Mobility"],
    references: [NASA_FITNESS, NASA_EXERCISE],
  },
  mobility: {
    benefits:
      "Stretching and joint-range routines preserve flexibility and agility — two of the performance areas NASA documents as declining in microgravity. They also lower injury risk during EVA prep and equipment tasks.",
    consequences:
      "Flexibility and coordination erode quietly over weeks without deliberate work; routine movements and suited tasks feel stiffer, and injury risk during transitions rises modestly.",
    supports: ["Flexibility", "Agility", "Injury prevention"],
    references: [NASA_FITNESS, WHO_ACTIVITY],
  },
  bands: {
    benefits:
      "Resistance-band work is a portable complement to the main devices: it maintains upper-body pulling and pressing strength and adds muscular endurance with minimal setup time.",
    consequences:
      "Bands alone cannot fully replace high axial loading for bone, so consistently dropping them mainly costs upper-body strength volume — one of the domains where crew show the largest average losses.",
    supports: ["Muscle strength", "Upper body", "Training volume"],
    references: [NASA_FITNESS, NASA_EXERCISE],
  },
};
type GuidanceKey = keyof typeof GUIDANCE;

const FOCUS_FALLBACK: Record<string, GuidanceKey> = {
  Resistance: "resistive",
  Cardio: "cycle",
  Core: "core",
  Mobility: "mobility",
};

/** Best-matching guidance for a session by name keywords, else by focus. */
export function guidanceFor(session: { name: string; focus: string }): ExerciseGuidance {
  const n = session.name.toLowerCase();
  if (/(band|elastic)/.test(n)) return GUIDANCE["bands"];
  if (/(ared|squat|deadlift|weight|strength|resist)/.test(n)) return GUIDANCE["resistive"];
  if (/(treadmill|run|jog|sprint|t2)/.test(n)) return GUIDANCE["treadmill"];
  if (/(cevis|cycle|ergometer|bike|spin)/.test(n)) return GUIDANCE["cycle"];
  if (/(core|plank|postur|stabil|balance)/.test(n)) return GUIDANCE["core"];
  if (/(stretch|mobility|yoga|flex|warm-?up)/.test(n)) return GUIDANCE["mobility"];
  return GUIDANCE[FOCUS_FALLBACK[session.focus] ?? "resistive"];
}
