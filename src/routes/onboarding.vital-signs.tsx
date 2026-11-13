import { createFileRoute } from "@tanstack/react-router";

import pulseOximeter from "@/assets/onboarding/pulse-oximeter.jpg.asset.json";
import { CheckRow, Field, FieldLabel, UnitInput } from "@/components/onboarding/fields";
import { numericOnly } from "@/components/onboarding/logic";
import { OnboardingScene } from "@/components/onboarding/OnboardingScene";
import { useOnboardingSection } from "@/components/onboarding/onboarding-store";
import { StepCard } from "@/components/onboarding/StepCard";
import { StepFooter } from "@/components/onboarding/StepFooter";
import { stepHead } from "@/components/onboarding/steps";
import { WhyWeAsk } from "@/components/onboarding/WhyWeAsk";

export const Route = createFileRoute("/onboarding/vital-signs")({
  head: () =>
    stepHead(
      "Vital Signs",
      "Add your latest blood pressure, respiratory rate and blood-oxygen readings to Astra Health.",
    ),
  component: VitalSignsPage,
});

const rangeOnly = (v: string) => v.replace(/[^\d.\-–]/g, "");

function VitalSignsPage() {
  const [vitals, set] = useOnboardingSection("vitals");

  return (
    <OnboardingScene
      step={3}
      aside={
        <WhyWeAsk
          image={pulseOximeter.url}
          imageAlt="Astronaut glove wearing a pulse oximeter reading 98%"
        >
          Blood pressure, respiratory rate and SpO<sub>2</sub> are early indicators of stress,
          altitude and oxygen changes during missions.
        </WhyWeAsk>
      }
    >
      <StepCard
        title="Vital"
        accent="Signs"
        subtitle="Enter your latest readings. Not sure? Tick “I don’t know”."
        footer={<StepFooter step={3} />}
      >
        <FieldLabel hint="(mmHg)" id="bp-label">
          Blood Pressure
        </FieldLabel>
        <div
          role="group"
          aria-labelledby="bp-label"
          className="mt-[6px] grid grid-cols-2 gap-x-[26px]"
        >
          <Field label="Systolic (top)" htmlFor="systolic">
            <UnitInput
              id="systolic"
              inputMode="numeric"
              placeholder="120"
              maxLength={3}
              disabled={vitals.bpUnknown}
              value={vitals.systolic}
              onChange={(e) => set({ systolic: numericOnly(e.target.value).replace(".", "") })}
              unit="mmHg"
            />
          </Field>
          <Field label="Diastolic (bottom)" htmlFor="diastolic">
            <UnitInput
              id="diastolic"
              inputMode="numeric"
              placeholder="80"
              maxLength={3}
              disabled={vitals.bpUnknown}
              value={vitals.diastolic}
              onChange={(e) => set({ diastolic: numericOnly(e.target.value).replace(".", "") })}
              unit="mmHg"
            />
          </Field>
        </div>
        <CheckRow
          className="mt-[12px]"
          checked={vitals.bpUnknown}
          onChange={(bpUnknown) => set({ bpUnknown })}
        >
          I don’t know my blood pressure
        </CheckRow>

        <div className="mt-[18px] grid grid-cols-2 gap-x-[26px]">
          <Field label="Respiratory Rate" htmlFor="respiratory-rate">
            <UnitInput
              id="respiratory-rate"
              inputMode="decimal"
              placeholder="12–20"
              value={vitals.respiratoryRate}
              onChange={(e) => set({ respiratoryRate: rangeOnly(e.target.value) })}
              unit="breaths/min"
            />
          </Field>
          <Field
            label={
              <>
                SpO<sub>2</sub> (blood oxygen)
              </>
            }
            htmlFor="spo2"
          >
            <UnitInput
              id="spo2"
              inputMode="decimal"
              placeholder="95–100"
              value={vitals.spo2}
              onChange={(e) => set({ spo2: rangeOnly(e.target.value) })}
              unit="%"
            />
          </Field>
        </div>
        <CheckRow
          className="mt-[20px]"
          checked={vitals.measuredWithDevice}
          onChange={(measuredWithDevice) => set({ measuredWithDevice })}
        >
          Measured with a pulse oximeter / wearable
        </CheckRow>
      </StepCard>
    </OnboardingScene>
  );
}
