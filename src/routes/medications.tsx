import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { stepHead } from "@/components/onboarding/steps";
import { Medications, MedicationsHeaderActions, MedicationsHeaderTitle } from "@/pages/Medications";

export const Route = createFileRoute("/medications")({
  head: () =>
    stepHead(
      "Medications",
      "Track your medications, orbital pharmacy stock, and daily supplements.",
    ),
  component: MedicationsRoutePage,
});

function MedicationsRoutePage() {
  return (
    <DashboardShell
      fluid
      headerTitle={<MedicationsHeaderTitle />}
      headerRight={<MedicationsHeaderActions />}
      statusWeekday
    >
      <Medications />
    </DashboardShell>
  );
}
