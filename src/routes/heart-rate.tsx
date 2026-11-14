import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { stepHead } from "@/components/onboarding/steps";
import { HeartRate, HeartRateHeaderBadge } from "@/pages/HeartRate";

export const Route = createFileRoute("/heart-rate")({
  head: () =>
    stepHead(
      "Heart Rate Monitoring",
      "Real-time simulated heart rate, ECG monitoring waveform, and 24-hour heart rate statistics.",
    ),
  component: HeartRateRoutePage,
});

function HeartRateRoutePage() {
  return (
    <DashboardShell
      headerTitle={
        <>
          Heart Rate
          <br />
          Monitoring
        </>
      }
      headerRight={<HeartRateHeaderBadge />}
    >
      <HeartRate />
    </DashboardShell>
  );
}
