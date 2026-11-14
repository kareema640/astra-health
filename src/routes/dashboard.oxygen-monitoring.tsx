import { createFileRoute } from "@tanstack/react-router";

import { OxygenMonitoringView } from "@/components/dashboard/OxygenMonitoringView";
import { stepHead } from "@/components/onboarding/steps";

export const Route = createFileRoute("/dashboard/oxygen-monitoring")({
  head: () =>
    stepHead(
      "Oxygen Monitoring (SpO2)",
      "Blood oxygen saturation, pulse rate and 24-hour SpO2 trend overview.",
    ),
  component: OxygenMonitoringPage,
});

function OxygenMonitoringPage() {
  return <OxygenMonitoringView />;
}
