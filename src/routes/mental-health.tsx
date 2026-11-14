import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Heart, Sparkles, Wind } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { stepHead } from "@/components/onboarding/steps";

export const Route = createFileRoute("/mental-health")({
  head: () =>
    stepHead("Mental Health", "Astronaut cognitive wellness, mood logs, and stress telemetry."),
  component: MentalHealthPage,
});

function MentalHealthPage() {
  return (
    <DashboardShell
      hideHeaderTitle
      statusWeekday
      statusSeparator="dot"
      sidebarVariant="profile"
      calmBackdrop
    >
      <div className="flex w-full flex-col gap-[22px]">
        <div className="dash-card-calm flex flex-col items-center px-[24px] py-[44px] text-center sm:px-[36px]">
          <span className="flex size-[64px] items-center justify-center rounded-full border border-[#F25C3C]/35 bg-[#F25C3C]/12 text-[#F25C3C]">
            <Brain className="size-[32px]" strokeWidth={1.8} />
          </span>
          <h1 className="mt-[18px] text-[28px] font-bold text-foreground sm:text-[32px]">
            Mental Health &amp; Cognitive Wellness
          </h1>
          <p className="mt-[8px] max-w-[540px] text-[15.5px] leading-[23px] text-dash-muted">
            Orbital mood logs, decompression breathing cycles, and stress readiness indicators
            calibrated for long-duration spaceflight.
          </p>

          <div className="mt-[28px] grid w-full max-w-[820px] grid-cols-1 gap-[14px] text-left sm:grid-cols-3">
            <div className="rounded-[18px] border border-white/12 bg-white/[0.04] p-[18px]">
              <Heart className="size-[22px] text-[#F25C3C]" />
              <p className="mt-[10px] text-[14px] text-foreground/65">Current Mood</p>
              <p className="mt-[2px] text-[20px] font-bold text-dash-green">Good · Balanced</p>
            </div>
            <div className="rounded-[18px] border border-white/12 bg-white/[0.04] p-[18px]">
              <Wind className="size-[22px] text-[#F25C3C]" />
              <p className="mt-[10px] text-[14px] text-foreground/65">Stress Load</p>
              <p className="mt-[2px] text-[20px] font-bold text-dash-ice">Low · Optimal</p>
            </div>
            <div className="rounded-[18px] border border-white/12 bg-white/[0.04] p-[18px]">
              <Sparkles className="size-[22px] text-[#F25C3C]" />
              <p className="mt-[10px] text-[14px] text-foreground/65">Focus Window</p>
              <p className="mt-[2px] text-[20px] font-bold text-foreground">92% Readiness</p>
            </div>
          </div>

          <Link
            to="/profile"
            className="mt-[28px] inline-flex h-[46px] items-center rounded-full bg-[#3B82F6] px-[26px] text-[15.5px] font-medium text-white transition-colors hover:bg-[#2563EB]"
          >
            Manage Mood &amp; Stress in Profile
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
