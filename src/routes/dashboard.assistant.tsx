import { createFileRoute } from "@tanstack/react-router";

import { AssistantView } from "@/components/dashboard/AssistantView";
import { stepHead } from "@/components/onboarding/steps";

export const Route = createFileRoute("/dashboard/assistant")({
  head: () => stepHead("AI Assistant", "Your intelligent health companion in space."),
  component: Page,
});

function Page() {
  return <AssistantView />;
}
