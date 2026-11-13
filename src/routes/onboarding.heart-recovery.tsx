import { createFileRoute } from "@tanstack/react-router";

import heartRateZones from "@/assets/onboarding/heart-rate-zones.jpg.asset.json";
import { ChipGroup, Field, MultiChipGroup, UnitInput } from "@/components/onboarding/fields";
import {
  numericOnly,
  toggleHeartCondition,
  type HeartCondition,
} from "@/components/onboarding/logic";
import { OnboardingScene } from "@/components/onboarding/OnboardingScene";
import {
  useOnboardingSection,
  type OnboardingData,
} from "@/components/onboarding/onboarding-store";
import { StepCard } from "@/components/onboarding/StepCard";
import { StepFooter } from "@/components/onboarding/StepFooter";
import { stepHead } from "@/components/onboarding/steps";
import { WhyWeAsk } from "@/components/onboarding/WhyWeAsk";

export const Route = createFileRoute("/onboarding/heart-recovery")({
  head: () =>
    stepHead(
      "Heart & Recovery",
      "Set up heart-rhythm alerts and share your sleep and hydration habits with Astra Health.",
    ),
  component: HeartRecoveryPage,
});

type Heart = OnboardingData["heart"];

const ALERT_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "on", label: "On" },
] as const satisfies readonly { value: Heart["heartAlert"]; label: string }[];

const CONDITION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "arrhythmia", label: "Arrhythmia" },
  { value: "hypertension", label: "Hypertension" },
  { value: "other", label: "Other" },
] as const satisfies readonly { value: HeartCondition; label: string }[];

const SLEEP_OPTIONS = [
  { value: "lt5", label: "< 5 h" },
  { value: "5-6", label: "5–6 h" },
  { value: "7-8", label: "7–8 h" },
  { value: "9plus", label: "9+ h" },
] as const satisfies readonly { value: Heart["sleep"]; label: string }[];

const HYDRATION_OPTIONS = [
  { value: "lt1", label: "< 1 L" },
  { value: "1-2", label: "1–2 L" },
  { value: "2-3", label: "2–3 L" },
  { value: "3plus", label: "3+ L" },
] as const satisfies readonly { value: Heart["hydration"]; label: string }[];

const bpm = (v: string) => numericOnly(v).replace(".", "");

function HeartRecoveryPage() {
  const [heart, set] = useOnboardingSection("heart");
  const alertsOff = heart.heartAlert === "off";

  return (
    <OnboardingScene
      step={4}
      aside={
        <WhyWeAsk
          image={heartRateZones.url}
          imageAlt="Heart-rate training zones 1 to 5 as a percentage of max heart rate"
        >
          Heart alerts watch for rhythm changes. Sleep and hydration strongly affect heart rate,
          recovery and performance.
        </WhyWeAsk>
      }
    >
      <StepCard
        title="Heart &"
        accent="Recovery"
        subtitle="Set up heart alerts and your daily recovery habits."
        footer={<StepFooter step={4} />}
      >
        <Field
          label="Heart Alert"
          hint="(notify me about abnormal heart rhythm)"
          labelId="heart-alert-label"
        >
          <ChipGroup
            labelledBy="heart-alert-label"
            options={ALERT_OPTIONS}
            value={heart.heartAlert}
            onChange={(heartAlert) => set({ heartAlert })}
          />
        </Field>

        <div className="mt-[16px] grid grid-cols-2 gap-x-[26px] gap-y-[16px]">
          <Field label="Resting heart rate" htmlFor="resting-hr">
            <UnitInput
              id="resting-hr"
              inputMode="numeric"
              placeholder="e.g. 62"
              maxLength={3}
              value={heart.restingHr}
              onChange={(e) => set({ restingHr: bpm(e.target.value) })}
              unit="bpm"
            />
          </Field>
          <Field label="Known heart conditions" labelId="conditions-label">
            <MultiChipGroup
              labelledBy="conditions-label"
              options={CONDITION_OPTIONS}
              values={heart.conditions}
              onToggle={(c) => set({ conditions: toggleHeartCondition(heart.conditions, c) })}
            />
          </Field>
          <Field label="Alert if above" htmlFor="alert-above">
            <UnitInput
              id="alert-above"
              inputMode="numeric"
              placeholder="e.g. 120"
              maxLength={3}
              disabled={alertsOff}
              value={heart.alertAbove}
              onChange={(e) => set({ alertAbove: bpm(e.target.value) })}
              unit="bpm"
            />
          </Field>
          <Field label="Alert if below" htmlFor="alert-below">
            <UnitInput
              id="alert-below"
              inputMode="numeric"
              placeholder="e.g. 45"
              maxLength={3}
              disabled={alertsOff}
              value={heart.alertBelow}
              onChange={(e) => set({ alertBelow: bpm(e.target.value) })}
              unit="bpm"
            />
          </Field>
        </div>

        <Field
          className="mt-[16px]"
          label="Sleep duration"
          hint="(average per night)"
          labelId="sleep-label"
        >
          <ChipGroup
            labelledBy="sleep-label"
            options={SLEEP_OPTIONS}
            value={heart.sleep}
            onChange={(sleep) => set({ sleep })}
          />
        </Field>
        <Field
          className="mt-[15px]"
          label="Hydration"
          hint="(water per day)"
          labelId="hydration-label"
        >
          <ChipGroup
            labelledBy="hydration-label"
            options={HYDRATION_OPTIONS}
            value={heart.hydration}
            onChange={(hydration) => set({ hydration })}
          />
        </Field>
      </StepCard>
    </OnboardingScene>
  );
}
