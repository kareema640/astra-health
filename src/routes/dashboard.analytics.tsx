import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ClipboardCheck, HeartPulse, Pencil, ShieldCheck, UserCheck } from "lucide-react";

import { RingGauge } from "@/components/dashboard/charts";
import {
  bmi,
  BONE_LABEL,
  CONDITION_LABEL,
  EMG_LABEL,
  parseReading,
  profileCompleteness,
  reportedHydration,
  reportedSleep,
  SEX_LABEL,
} from "@/components/dashboard/health";
import {
  CardHeading,
  DASH_GHOST,
  DashCard,
  InfoRow,
  PageHeader,
  RangeBar,
} from "@/components/dashboard/ui";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { stepHead } from "@/components/onboarding/steps";
import { computeHealthScore } from "@/data/profileData";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () =>
    stepHead(
      "Health Analytics",
      "Comprehensive summary of your biometric inputs, completeness score, and physiological reference bands.",
    ),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data } = useOnboarding();
  const { account, basic, vitals, heart, muscle } = data;
  const completeness = profileCompleteness(data);
  const completionPct = Math.round((completeness.filled / completeness.total) * 100);
  const healthScore = computeHealthScore(data);
  const bmiValue = bmi(basic);
  const sleep = reportedSleep(data);
  const hydration = reportedHydration(data);

  return (
    <div className="flex w-full flex-col gap-[20px]">
      <PageHeader
        title="Health Analytics"
        subtitle="Biometric evaluation computed from your Astra Health onboarding profile and telemetry baselines."
        actions={
          <Link to="/onboarding/basic-info" className={DASH_GHOST}>
            <Pencil className="size-[16px]" />
            Edit Health Profile
          </Link>
        }
      />

      {/* Top 3 Analytic Gauges */}
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
        <DashCard className="flex items-center justify-between gap-[16px] p-[22px]">
          <div className="min-w-0">
            <CardHeading icon={ShieldCheck} title="Readiness Score" />
            <p className="mt-[12px] text-[36px] leading-[40px] font-bold tabular-nums text-foreground">
              {healthScore}%
            </p>
            <p className="mt-[4px] text-[13.5px] text-dash-muted">
              Composite score from vitals &amp; rest
            </p>
          </div>
          <RingGauge
            size={88}
            stroke={9}
            fraction={healthScore / 100}
            label={`Readiness ${healthScore}%`}
          >
            <span className="text-[16px] font-bold tabular-nums text-foreground">
              {healthScore}%
            </span>
          </RingGauge>
        </DashCard>

        <DashCard className="flex items-center justify-between gap-[16px] p-[22px]">
          <div className="min-w-0">
            <CardHeading icon={ClipboardCheck} title="Profile Setup" />
            <p className="mt-[12px] text-[36px] leading-[40px] font-bold tabular-nums text-foreground">
              {completeness.filled}/{completeness.total}
            </p>
            <p className="mt-[4px] text-[13.5px] text-dash-muted">
              {completionPct}% of baseline fields saved
            </p>
          </div>
          <RingGauge
            size={88}
            stroke={9}
            fraction={completeness.filled / completeness.total}
            label={`Profile completion ${completionPct}%`}
          >
            <span className="text-[16px] font-bold tabular-nums text-foreground">
              {completionPct}%
            </span>
          </RingGauge>
        </DashCard>

        <DashCard className="flex items-center justify-between gap-[16px] p-[22px]">
          <div className="min-w-0">
            <CardHeading icon={UserCheck} title="Body Mass Index" />
            <p className="mt-[12px] text-[36px] leading-[40px] font-bold tabular-nums text-foreground">
              {bmiValue ?? "—"}
            </p>
            <p className="mt-[4px] text-[13.5px] text-dash-muted">
              {bmiValue ? "Derived from height & weight" : "Add height & weight to compute"}
            </p>
          </div>
          <RingGauge
            size={88}
            stroke={9}
            fraction={bmiValue ? Math.min(1, bmiValue / 35) : null}
            label={bmiValue ? `BMI ${bmiValue}` : "BMI not computed"}
          >
            <span className="text-[14px] font-bold text-dash-ice">BMI</span>
          </RingGauge>
        </DashCard>
      </div>

      {/* Main Analytics Detail Grid */}
      <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-2">
        <DashCard className="flex flex-col gap-[18px] p-[22px] sm:p-[24px]">
          <CardHeading icon={Activity} title="Physiological Reference Ranges" />
          <div className="flex flex-col gap-[18px]">
            <div>
              <div className="mb-[6px] flex items-center justify-between text-[14.5px]">
                <span className="font-medium text-foreground">Body Mass Index (BMI)</span>
                <span className="tabular-nums text-dash-ice">
                  {bmiValue ? `${bmiValue} kg/m²` : "Not entered"}
                </span>
              </div>
              <RangeBar
                min={15}
                max={35}
                low={18.5}
                high={24.9}
                value={bmiValue}
                caption="Healthy range 18.5–24.9"
              />
            </div>

            <div>
              <div className="mb-[6px] flex items-center justify-between text-[14.5px]">
                <span className="font-medium text-foreground">Resting Heart Rate</span>
                <span className="tabular-nums text-dash-ice">
                  {heart.restingHr.trim() ? `${heart.restingHr} bpm` : "Not entered"}
                </span>
              </div>
              <RangeBar
                min={40}
                max={120}
                low={60}
                high={100}
                value={parseReading(heart.restingHr)}
                caption="Resting adult range 60–100 bpm"
              />
            </div>

            <div>
              <div className="mb-[6px] flex items-center justify-between text-[14.5px]">
                <span className="font-medium text-foreground">SpO₂ Blood Oxygen</span>
                <span className="tabular-nums text-dash-ice">
                  {vitals.spo2.trim() ? `${vitals.spo2}%` : "Not entered"}
                </span>
              </div>
              <RangeBar
                min={85}
                max={100}
                low={95}
                high={100}
                value={parseReading(vitals.spo2)}
                caption="Target orbital range 95–100%"
              />
            </div>

            <div>
              <div className="mb-[6px] flex items-center justify-between text-[14.5px]">
                <span className="font-medium text-foreground">Respiratory Rate</span>
                <span className="tabular-nums text-dash-ice">
                  {vitals.respiratoryRate.trim()
                    ? `${vitals.respiratoryRate} br/min`
                    : "Not entered"}
                </span>
              </div>
              <RangeBar
                min={8}
                max={28}
                low={12}
                high={20}
                value={parseReading(vitals.respiratoryRate)}
                caption="Resting range 12–20 br/min"
              />
            </div>
          </div>
        </DashCard>

        <DashCard className="flex flex-col p-[22px] sm:p-[24px]">
          <CardHeading icon={HeartPulse} title="Astronaut Biometric Profile" />
          <div className="mt-[10px]">
            <InfoRow label="Crew Member" value={account.fullName.trim() || "Sarah"} />
            <InfoRow label="Astronaut ID" value={account.astronautId.trim() || "AST-042"} />
            <InfoRow label="Age" value={basic.age.trim() ? `${basic.age} years` : "Not entered"} />
            <InfoRow label="Sex (assigned at birth)" value={SEX_LABEL[basic.sex]} />
            <InfoRow
              label="Height & Weight"
              value={
                basic.height.trim() && basic.weight.trim()
                  ? `${basic.height} ${basic.heightUnit === "cm" ? "cm" : ""} · ${basic.weight} ${basic.weightUnit}`
                  : "Not entered"
              }
            />
            <InfoRow label="Sleep Window" value={sleep?.label ?? "7–8 h (default)"} />
            <InfoRow label="Daily Hydration" value={hydration ?? "2–3 L (default)"} />
            <InfoRow
              label="Heart Conditions"
              value={heart.conditions.map((c) => CONDITION_LABEL[c]).join(", ")}
            />
            <InfoRow
              label="Muscle / Bone"
              value={`${muscle.muscleMass.trim() ? `${muscle.muscleMass} kg` : "—"} · ${BONE_LABEL[muscle.boneDensity]} · ${EMG_LABEL[muscle.emgGroup]}`}
            />
          </div>
        </DashCard>
      </div>
    </div>
  );
}
