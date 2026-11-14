import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { stepHead } from "@/components/onboarding/steps";
import { PhysicalActivity } from "@/pages/PhysicalActivity";

export const Route = createFileRoute("/physical-activity")({
  head: () =>
    stepHead(
      "Physical Activity",
      "Daily microgravity countermeasure workouts, consistency tracking, and guided exercise player.",
    ),
  component: PhysicalActivityRoutePage,
});

function PhysicalActivityRoutePage() {
  return (
    <DashboardShell hideDesktopHeader headerTitle="Physical Activity">
      <PhysicalActivity />
    </DashboardShell>
  );
}
