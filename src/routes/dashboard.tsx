import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";

/** Sidebar + header layout around every dashboard page. */
export const Route = createFileRoute("/dashboard")({
  component: DashboardShell,
});
