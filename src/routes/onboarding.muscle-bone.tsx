import { createFileRoute } from "@tanstack/react-router";

import muscleGroupMap from "@/assets/onboarding/muscle-group-map.jpg.asset.json";
import { ChipGroup, Field, UnitInput, UploadDrop } from "@/components/onboarding/fields";
import { numericOnly } from "@/components/onboarding/logic";
import { OnboardingScene } from "@/components/onboarding/OnboardingScene";
import {
  useOnboardingSection,
  type OnboardingData,
} from "@/components/onboarding/onboarding-store";
import { StepCard } from "@/components/onboarding/StepCard";
import { StepFooter } from "@/components/onboarding/StepFooter";
import { stepHead } from "@/components/onboarding/steps";
import { WhyWeAsk } from "@/components/onboarding/WhyWeAsk";

export const Route = createFileRoute("/onboarding/muscle-bone")({
  head: () =>
    stepHead(
      "Muscle & Bone",
      "Add muscle mass, bone density and EMG or DEXA reports to track muscle and bone loss in microgravity.",
    ),
  component: MuscleBonePage,
});

type Muscle = OnboardingData["muscle"];

const BONE_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "osteopenia", label: "Osteopenia" },
  { value: "osteoporosis", label: "Osteoporosis" },
  { value: "unknown", label: "Unknown" },
] as const satisfies readonly { value: Muscle["boneDensity"]; label: string }[];

const EMG_GROUPS = [
  { value: "biceps", label: "Biceps" },
  { value: "quadriceps", label: "Quadriceps" },
  { value: "calf", label: "Calf" },
  { value: "core", label: "Core" },
  { value: "forearm", label: "Forearm" },
] as const satisfies readonly { value: Muscle["emgGroup"]; label: string }[];

function MuscleBonePage() {
  const [muscle, set] = useOnboardingSection("muscle");

  return (
    <OnboardingScene
      step={5}
      aside={
        <WhyWeAsk
          image={muscleGroupMap.url}
          imageAlt="Astronaut in a spacesuit with glowing EMG sensor points on the arm, core, thigh and calf"
        >
          Muscle mass, EMG and bone density help track muscle and bone loss, which matters most in
          microgravity.
        </WhyWeAsk>
      }
    >
      <StepCard
        title="Muscle &"
        accent="Bone"
        subtitle="Optional body-composition data, upload reports if you have them."
        footer={<StepFooter step={5} />}
      >
        <div className="grid grid-cols-2 gap-x-[26px]">
          <Field label="Muscle Mass" htmlFor="muscle-mass">
            <UnitInput
              id="muscle-mass"
              inputMode="decimal"
              placeholder="e.g. 32"
              value={muscle.muscleMass}
              onChange={(e) => set({ muscleMass: numericOnly(e.target.value) })}
              unit="kg"
            />
          </Field>
          <Field label="Bone Density (T-score)" labelId="bone-label">
            <ChipGroup
              labelledBy="bone-label"
              options={BONE_OPTIONS}
              value={muscle.boneDensity}
              onChange={(boneDensity) => set({ boneDensity })}
            />
          </Field>
        </div>

        <Field className="mt-[15px]" label="EMG recording / report">
          <UploadDrop
            title="Upload EMG waveform or report"
            fileName={muscle.emgFile}
            onFile={(emgFile) => set({ emgFile })}
          />
        </Field>
        <Field className="mt-[15px]" label="Bone density scan (DEXA)">
          <UploadDrop
            title="Upload DEXA scan"
            fileName={muscle.dexaFile}
            onFile={(dexaFile) => set({ dexaFile })}
          />
        </Field>
        <Field
          className="mt-[15px]"
          label="EMG muscle group"
          hint="(where the EMG was taken)"
          labelId="emg-group-label"
        >
          <ChipGroup
            labelledBy="emg-group-label"
            options={EMG_GROUPS}
            value={muscle.emgGroup}
            onChange={(emgGroup) => set({ emgGroup })}
          />
        </Field>
      </StepCard>
    </OnboardingScene>
  );
}
