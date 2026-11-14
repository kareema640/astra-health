import { createFileRoute } from "@tanstack/react-router";

import { stepHead } from "@/components/onboarding/steps";
import { SleepQuality } from "@/pages/SleepQuality";

export const Route = createFileRoute("/dashboard/sleep")({
  head: () =>
    stepHead(
      "Sleep Quality",
      "Track your sleep duration, efficiency, sleep score, deep sleep, and nightly trends.",
    ),
  component: SleepQuality,
});
