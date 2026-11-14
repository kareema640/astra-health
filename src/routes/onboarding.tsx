import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Shared parent of the health-profile steps. Answers live in the root OnboardingProvider. */
export const Route = createFileRoute("/onboarding")({
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return <Outlet />;
}
