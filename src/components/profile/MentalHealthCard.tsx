import { Brain, Check, Heart } from "lucide-react";
import { useState, type SVGProps } from "react";

import {
  moodToneClass,
  stressToneClass,
  type MoodValue,
  type ProfilePreferences,
  type StressValue,
} from "@/data/profileData";
import { cn } from "@/lib/utils";

import { Modal } from "./Modal";
import { SettingRow } from "./SettingRow";

interface MentalHealthCardProps {
  prefs: ProfilePreferences;
  onUpdate: (patch: Partial<ProfilePreferences>) => void;
}

const MOOD_OPTIONS: readonly { value: MoodValue; hint: string; dot: string }[] = [
  { value: "Great", hint: "Energized & focused", dot: "bg-dash-green" },
  { value: "Good", hint: "Balanced & steady", dot: "bg-dash-green" },
  { value: "Okay", hint: "Slightly fatigued", dot: "bg-dash-amber" },
  { value: "Low", hint: "Rest & recovery advised", dot: "bg-[#F25C3C]" },
];

const STRESS_OPTIONS: readonly { value: StressValue; hint: string; dot: string }[] = [
  { value: "Low", hint: "Optimal orbital readiness", dot: "bg-dash-green" },
  { value: "Medium", hint: "Moderate workload load", dot: "bg-dash-amber" },
  { value: "High", hint: "Schedule decompression", dot: "bg-[#F25C3C]" },
];

/** Clean coral lotus icon matching the Stress Level row in the reference screenshot. */
function LotusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 4.5c-1.8 2.4-2.8 5-2.8 7.5 0 2.3 1.2 4.3 2.8 5.4 1.6-1.1 2.8-3.1 2.8-5.4 0-2.5-1-5.1-2.8-7.5Z" />
      <path d="M8.5 14.8c-.4-2.3-1.8-4.5-4.3-6.1-.4 3 .5 5.8 2.7 7.6 1 .8 2.2 1.2 3.3 1.3-.9-.7-1.5-1.7-1.7-2.8Z" />
      <path d="M15.5 14.8c.4-2.3 1.8-4.5 4.3-6.1.4 3-.5 5.8-2.7 7.6-1 .8-2.2 1.2-3.3 1.3.9-.7 1.5-1.7 1.7-2.8Z" />
      <path d="M5.4 17.8c2.1.6 4.4.8 6.6.8s4.5-.2 6.6-.8c-.7 1.3-3.1 2.2-6.6 2.2s-5.9-.9-6.6-2.2Z" />
    </svg>
  );
}

export function MentalHealthCard({ prefs, onUpdate }: MentalHealthCardProps) {
  const [modal, setModal] = useState<"mood" | "stress" | null>(null);

  return (
    <>
      <section aria-label="Mental Health" className="dash-card-calm p-[26px]">
        <div className="flex items-center gap-[12px]">
          <Brain className="size-[24px] shrink-0 text-[#F25C3C]" strokeWidth={2} />
          <h2 className="text-[20px] font-semibold tracking-[-0.005em] text-foreground">
            Mental Health
          </h2>
        </div>

        <div className="my-[14px] h-px w-full bg-white/15" />

        <div className="flex flex-col gap-[4px]">
          <SettingRow
            icon={Heart}
            label="Mood Tracking"
            value={prefs.mood}
            valueClassName={moodToneClass(prefs.mood)}
            onClick={() => setModal("mood")}
          />
          <SettingRow
            icon={LotusIcon}
            label="Stress Level"
            value={prefs.stress}
            valueClassName={stressToneClass(prefs.stress)}
            onClick={() => setModal("stress")}
          />
        </div>
      </section>

      <Modal
        open={modal === "mood"}
        onClose={() => setModal(null)}
        title="Mood Tracking"
        subtitle="Log your current emotional state for orbital wellness tracking."
      >
        <div className="flex flex-col gap-[10px]">
          {MOOD_OPTIONS.map((opt) => {
            const active = prefs.mood === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onUpdate({ mood: opt.value });
                  setModal(null);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-[14px] border px-[16px] py-[12px] text-left transition-colors",
                  active
                    ? "border-[#3B82F6] bg-[#3B82F6]/20"
                    : "border-white/15 bg-white/[0.04] hover:border-blue-400/50 hover:bg-white/[0.08]",
                )}
              >
                <div className="flex items-center gap-[12px]">
                  <span className={cn("size-[10px] rounded-full", opt.dot)} />
                  <div>
                    <div className="text-[16px] font-medium text-foreground">{opt.value}</div>
                    <div className="text-[12.5px] text-dash-muted">{opt.hint}</div>
                  </div>
                </div>
                {active && (
                  <span className="flex size-[22px] items-center justify-center rounded-full bg-[#3B82F6] text-white">
                    <Check className="size-[13px]" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={modal === "stress"}
        onClose={() => setModal(null)}
        title="Stress Level"
        subtitle="Select your current stress index."
      >
        <div className="flex flex-col gap-[10px]">
          {STRESS_OPTIONS.map((opt) => {
            const active = prefs.stress === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onUpdate({ stress: opt.value });
                  setModal(null);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-[14px] border px-[16px] py-[12px] text-left transition-colors",
                  active
                    ? "border-[#3B82F6] bg-[#3B82F6]/20"
                    : "border-white/15 bg-white/[0.04] hover:border-blue-400/50 hover:bg-white/[0.08]",
                )}
              >
                <div className="flex items-center gap-[12px]">
                  <span className={cn("size-[10px] rounded-full", opt.dot)} />
                  <div>
                    <div className="text-[16px] font-medium text-foreground">{opt.value}</div>
                    <div className="text-[12.5px] text-dash-muted">{opt.hint}</div>
                  </div>
                </div>
                {active && (
                  <span className="flex size-[22px] items-center justify-center rounded-full bg-[#3B82F6] text-white">
                    <Check className="size-[13px]" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
