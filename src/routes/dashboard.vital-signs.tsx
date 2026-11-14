import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BatteryMedium,
  Droplet,
  Gauge,
  HeartPulse,
  Pencil,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";

import { parseReading } from "@/components/dashboard/health";
import { LungsIcon } from "@/components/dashboard/icons";
import {
  CardHeading,
  DASH_GHOST,
  DashCard,
  PageHeader,
  RangeBar,
  SourceTag,
} from "@/components/dashboard/ui";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { stepHead } from "@/components/onboarding/steps";

export const Route = createFileRoute("/dashboard/vital-signs")({
  head: () =>
    stepHead(
      "Vital Signs",
      "Blood pressure, heart rate, SpO₂ and breathing rate from your Astra Health profile, with reference ranges.",
    ),
  component: VitalSignsPage,
});

type Icon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

function VitalSignsPage() {
  const { data } = useOnboarding();
  const { vitals, heart } = data;
  const bp = vitals.systolic.trim() && vitals.diastolic.trim();

  return (
    <div className="flex w-full flex-col gap-[20px]">
      <PageHeader
        title="Vital Signs"
        subtitle="Baseline vitals saved in your mission profile alongside quick links to dedicated telemetry monitors."
        actions={
          <Link to="/onboarding/vital-signs" className={DASH_GHOST}>
            <Pencil className="size-[16px]" />
            Update vital signs
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 2xl:grid-cols-3">
        <VitalCard
          icon={Gauge}
          title="Blood Pressure"
          state={bp ? "entered" : "missing"}
          value={
            bp ? `${vitals.systolic} / ${vitals.diastolic}` : vitals.bpUnknown ? "Unknown" : null
          }
          unit="mmHg"
          note={
            vitals.bpUnknown && !bp ? "You said you don't know your blood pressure." : undefined
          }
        >
          <RangeBar
            min={80}
            max={180}
            low={90}
            high={120}
            value={parseReading(vitals.systolic)}
            caption="Systolic · typical adult 90–120"
          />
          <div className="mt-[12px]">
            <RangeBar
              min={50}
              max={110}
              low={60}
              high={80}
              value={parseReading(vitals.diastolic)}
              caption="Diastolic · typical adult 60–80"
            />
          </div>
        </VitalCard>

        <VitalCard
          icon={HeartPulse}
          title="Resting Heart Rate"
          state={heart.restingHr.trim() ? "entered" : "missing"}
          value={heart.restingHr.trim() || null}
          unit="bpm"
          editTo="/onboarding/heart-recovery"
          monitorTo="/heart-rate"
          monitorLabel="Open Heart Rate Monitor"
        >
          <RangeBar
            min={40}
            max={120}
            low={60}
            high={100}
            value={parseReading(heart.restingHr)}
            caption="Typical adult resting 60–100"
          />
        </VitalCard>

        <VitalCard
          icon={Droplet}
          title="SpO₂ (blood oxygen)"
          state={vitals.spo2.trim() ? "entered" : "missing"}
          value={vitals.spo2.trim() || null}
          unit="%"
          monitorTo="/dashboard/oxygen-monitoring"
          monitorLabel="Open Oxygen Monitor"
        >
          <RangeBar
            min={85}
            max={100}
            low={95}
            high={100}
            value={parseReading(vitals.spo2)}
            caption="Typical 95–100"
          />
        </VitalCard>

        <VitalCard
          icon={LungsIcon}
          title="Breathing Rate"
          state={vitals.respiratoryRate.trim() ? "entered" : "missing"}
          value={vitals.respiratoryRate.trim() || null}
          unit="br/min"
          monitorTo="/respiratory"
          monitorLabel="Open Respiratory Monitor"
        >
          <RangeBar
            min={8}
            max={28}
            low={12}
            high={20}
            value={parseReading(vitals.respiratoryRate)}
            caption="Typical adult resting 12–20"
          />
        </VitalCard>

        <VitalCard
          icon={Thermometer}
          title="Body Temperature"
          state="no-sensor"
          value={null}
          unit="°C"
          monitorTo="/body-temperature"
          monitorLabel="Open Temperature Telemetry"
        >
          <RangeBar
            min={35}
            max={39}
            low={36.1}
            high={37.2}
            value={null}
            caption="Typical 36.1–37.2 °C"
          />
        </VitalCard>

        <VitalCard
          icon={BatteryMedium}
          title="Energy Readiness"
          state="no-sensor"
          value={null}
          unit="%"
        >
          <p className="text-[14px] leading-[20px] text-dash-muted">
            Energy readiness combines heart rate variability, sleep recovery, and daily activity.
            Connect a wearable sensor for live tracking.
          </p>
        </VitalCard>
      </div>

      <DashCard className="px-[22px] py-[18px]">
        <p className="text-[15px] leading-[22px] text-dash-muted">
          <span className="font-bold text-foreground">How these were measured: </span>
          {vitals.measuredWithDevice
            ? "recorded using a pulse oximeter or wearable device."
            : "self-reported baseline (no active wearable device selected)."}{" "}
          Reference ranges are general adult resting values for orientation only and do not
          constitute medical diagnosis.
        </p>
      </DashCard>
    </div>
  );
}

function VitalCard({
  icon: IconCmp,
  title,
  state,
  value,
  unit,
  note,
  editTo = "/onboarding/vital-signs",
  monitorTo,
  monitorLabel,
  children,
}: {
  icon: Icon;
  title: string;
  state: "entered" | "missing" | "no-sensor";
  value: string | null;
  unit: string;
  note?: string | undefined;
  editTo?: "/onboarding/vital-signs" | "/onboarding/heart-recovery";
  monitorTo?: "/heart-rate" | "/dashboard/oxygen-monitoring" | "/respiratory" | "/body-temperature";
  monitorLabel?: string;
  children: ReactNode;
}) {
  return (
    <DashCard className="flex flex-col px-[22px] pt-[18px] pb-[20px]">
      <CardHeading
        icon={IconCmp}
        title={title}
        right={
          state === "no-sensor" ? (
            <SourceTag state="no-sensor" />
          ) : (
            <Link
              to={editTo}
              className="text-[14px] text-dash-cyan underline-offset-4 hover:underline"
            >
              {state === "missing" ? "Add" : "Edit"}
            </Link>
          )
        }
      />
      <p className="mt-[12px] flex items-baseline gap-[6px]">
        {state === "no-sensor" ? (
          <span className="text-[28px] font-bold text-dash-muted">No sensor</span>
        ) : value ? (
          <>
            <span className="text-[36px] leading-[42px] font-bold tabular-nums text-foreground sm:text-[40px] sm:leading-[46px]">
              {value}
            </span>
            {value !== "Unknown" && <span className="text-[18px] text-foreground">{unit}</span>}
          </>
        ) : (
          <span className="text-[28px] leading-[44px] font-bold text-dash-amber">Not entered</span>
        )}
      </p>
      {state !== "no-sensor" && (
        <span className="mb-[14px]">
          <SourceTag state={state} />
          {note && <span className="ml-[8px] text-[13.5px] text-dash-muted">{note}</span>}
        </span>
      )}
      <div className="mt-auto pt-[6px]">{children}</div>
      {monitorTo && monitorLabel && (
        <Link
          to={monitorTo}
          className="mt-[14px] inline-flex items-center gap-[6px] border-t border-dash-line pt-[12px] text-[14px] font-medium text-dash-cyan transition-colors hover:text-dash-ice"
        >
          <span>{monitorLabel}</span>
          <ArrowRight className="size-[15px]" />
        </Link>
      )}
    </DashCard>
  );
}
