import { createFileRoute } from "@tanstack/react-router";

import bodySilhouette from "@/assets/onboarding/body-silhouette.jpg.asset.json";
import { ChipGroup, Field, UnitInput, UnitToggle } from "@/components/onboarding/fields";
import {
  convertHeight,
  convertWeight,
  feetInchesOnly,
  numericOnly,
  type HeightUnit,
  type WeightUnit,
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

export const Route = createFileRoute("/onboarding/basic-info")({
  head: () =>
    stepHead(
      "Basic Information",
      "Tell Astra Health your age, sex, height and weight to personalise your health baselines.",
    ),
  component: BasicInfoPage,
});

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const satisfies readonly { value: OnboardingData["basic"]["sex"]; label: string }[];

const HEIGHT_UNITS = [
  { value: "cm", label: "cm" },
  { value: "ftin", label: "ft/in" },
] as const satisfies readonly { value: HeightUnit; label: string }[];

const WEIGHT_UNITS = [
  { value: "kg", label: "kg" },
  { value: "lb", label: "lb" },
] as const satisfies readonly { value: WeightUnit; label: string }[];

function BasicInfoPage() {
  const [basic, set] = useOnboardingSection("basic");

  return (
    <OnboardingScene
      step={2}
      aside={
        <WhyWeAsk
          image={bodySilhouette.url}
          imageAlt="Holographic body silhouette with height measurement scale"
        >
          Age, sex, height and weight set the reference ranges for every metric we track, from heart
          rate to bone density.
        </WhyWeAsk>
      }
    >
      <StepCard
        title="Basic"
        accent="Information"
        subtitle="Tell us about yourself so we can personalise your baselines."
        footer={<StepFooter step={2} />}
      >
        <div className="grid grid-cols-1 gap-x-[26px] gap-y-[16px] sm:grid-cols-2">
          <Field label="Age" htmlFor="age">
            <UnitInput
              id="age"
              inputMode="numeric"
              placeholder="e.g. 34"
              maxLength={3}
              value={basic.age}
              onChange={(e) => set({ age: numericOnly(e.target.value).replace(".", "") })}
              unit="years"
            />
          </Field>
          <Field label="Sex" hint="(assigned at birth)" labelId="sex-label">
            <ChipGroup
              labelledBy="sex-label"
              options={SEX_OPTIONS}
              value={basic.sex}
              onChange={(sex) => set({ sex })}
            />
          </Field>
          <Field label="Height" htmlFor="height">
            <UnitInput
              id="height"
              inputMode={basic.heightUnit === "cm" ? "decimal" : "text"}
              placeholder={basic.heightUnit === "cm" ? "e.g. 175" : `e.g. 5'9"`}
              value={basic.height}
              onChange={(e) =>
                set({
                  height:
                    basic.heightUnit === "cm"
                      ? numericOnly(e.target.value)
                      : feetInchesOnly(e.target.value),
                })
              }
              unit={
                <UnitToggle
                  label="Height unit"
                  options={HEIGHT_UNITS}
                  value={basic.heightUnit}
                  onChange={(unit) =>
                    set({
                      heightUnit: unit,
                      height: convertHeight(basic.height, basic.heightUnit, unit),
                    })
                  }
                />
              }
            />
          </Field>
          <Field label="Weight" htmlFor="weight">
            <UnitInput
              id="weight"
              inputMode="decimal"
              placeholder={basic.weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
              value={basic.weight}
              onChange={(e) => set({ weight: numericOnly(e.target.value) })}
              unit={
                <UnitToggle
                  label="Weight unit"
                  options={WEIGHT_UNITS}
                  value={basic.weightUnit}
                  onChange={(unit) =>
                    set({
                      weightUnit: unit,
                      weight: convertWeight(basic.weight, basic.weightUnit, unit),
                    })
                  }
                />
              }
            />
          </Field>
        </div>
      </StepCard>
    </OnboardingScene>
  );
}
