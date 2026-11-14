import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { stepHead } from "@/components/onboarding/steps";
import { SleepHeaderBadge, SleepHeaderTitle, SleepQuality } from "@/pages/SleepQuality";

export const Route = createFileRoute("/sleep-quality")({
  head: () =>
    stepHead(
      "Sleep Quality",
      "Track your sleep duration, efficiency, sleep score, deep sleep, and nightly trends.",
    ),
  component: SleepQualityRoutePage,
});

function SleepQualityRoutePage() {
  return (
    <DashboardShell
      headerTitle={<SleepHeaderTitle />}
      headerRight={<SleepHeaderBadge />}
      statusWeekday
    >
      <SleepQuality />
    </DashboardShell>
  );
}
