import {
  Bell,
  BedDouble,
  CalendarDays,
  ChartLine,
  HeartPulse,
  House,
  Pill,
  Activity as PulseIcon,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { RunnerIcon } from "./icons";

export type DashPath =
  | "/dashboard"
  | "/dashboard/vital-signs"
  | "/sleep-quality"
  | "/dashboard/activity"
  | "/dashboard/trends"
  | "/dashboard/analytics"
  | "/dashboard/mission-planner"
  | "/physical-activity"
  | "/dashboard/profile"
  | "/profile"
  | "/mental-health"
  | "/medications"
  | "/dashboard/notifications"
  | "/dashboard/assistant";

export interface NavItem {
  to: DashPath;
  label: string;
  icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
}

/** Shared sidebar order across every dashboard and health monitoring page. */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: House },
  { to: "/dashboard/vital-signs", label: "Vital Signs", icon: HeartPulse },
  { to: "/sleep-quality", label: "Sleep Quality", icon: BedDouble },
  { to: "/dashboard/activity", label: "Activity", icon: RunnerIcon },
  { to: "/dashboard/trends", label: "Health Trends", icon: ChartLine },
  { to: "/dashboard/analytics", label: "Health Analytics", icon: PulseIcon },
  { to: "/dashboard/mission-planner", label: "Mission Planner", icon: CalendarDays },
  { to: "/physical-activity", label: "Physical Activity", icon: RunnerIcon },
  { to: "/medications", label: "Medications", icon: Pill },
  { to: "/profile", label: "Profile & Settings", icon: Settings },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

/** Preserved export alias pointing to the unified sidebar list. */
export const PROFILE_NAV_ITEMS: readonly NavItem[] = NAV_ITEMS;

/** Exact match for the overview, prefix/related-route match for section pages. */
export function isNavActive(pathname: string, to: DashPath) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (to === "/dashboard") return path === "/dashboard";
  if (to === "/dashboard/vital-signs") {
    return (
      path === to ||
      path.startsWith(`${to}/`) ||
      path === "/heart-rate" ||
      path === "/respiratory" ||
      path === "/body-temperature" ||
      path === "/dashboard/oxygen-monitoring"
    );
  }
  if (to === "/sleep-quality") {
    return path === to || path.startsWith(`${to}/`) || path === "/dashboard/sleep";
  }
  if (to === "/profile") {
    return (
      path === to ||
      path.startsWith(`${to}/`) ||
      path === "/dashboard/profile" ||
      path === "/mental-health"
    );
  }
  return path === to || path.startsWith(`${to}/`);
}
