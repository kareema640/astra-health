import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { stepHead } from "@/components/onboarding/steps";
import { Respiratory, RespiratoryHeaderBadge } from "@/pages/Respiratory";

export const Route = createFileRoute("/respiratory")({
  head: () =>
    stepHead(
      "Respiratory Monitoring",
      "Real-time simulated respiratory rate, computed summary metrics, and 24-hour RR trend.",
    ),
  component: RespiratoryRoutePage,
});

function RespiratoryRoutePage() {
  return (
    <DashboardShell
      headerTitle={
        <>
          Respiratory
          <br />
          Monitoring
        </>
      }
      headerRight={<RespiratoryHeaderBadge />}
    >
      <Respiratory />
    </DashboardShell>
  );
}
