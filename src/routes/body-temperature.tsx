import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { stepHead } from "@/components/onboarding/steps";
import { BodyTemperature, BodyTemperatureHeaderBadge } from "@/pages/BodyTemperature";

export const Route = createFileRoute("/body-temperature")({
  head: () =>
    stepHead(
      "Body Temperature",
      "Real-time simulated body temperature telemetry, computed summary metrics, and 24-hour trend.",
    ),
  component: BodyTemperatureRoutePage,
});

function BodyTemperatureRoutePage() {
  return (
    <DashboardShell headerTitle="Body Temperature" headerRight={<BodyTemperatureHeaderBadge />}>
      <BodyTemperature />
    </DashboardShell>
  );
}
