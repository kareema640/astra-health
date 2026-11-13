import { createFileRoute, Outlet } from "@tanstack/react-router";

import { OnboardingProvider } from "@/components/onboarding/onboarding-store";

/** Shared parent of the health-profile steps: keeps answers alive while moving between them. */
export const Route = createFileRoute("/onboarding")({
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Outlet />
    </OnboardingProvider>
  );
}
