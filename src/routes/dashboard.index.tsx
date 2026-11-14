import { createFileRoute } from "@tanstack/react-router";

import { DashboardOverview } from "@/components/dashboard/Overview";
import { stepHead } from "@/components/onboarding/steps";

export const Route = createFileRoute("/dashboard/")({
  head: () =>
    stepHead(
      "Dashboard",
      "Your astronaut health overview: heart rate, SpO₂, breathing, sleep and trends from your profile.",
    ),
  component: DashboardOverview,
});
