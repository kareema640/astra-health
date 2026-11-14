import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { stepHead } from "@/components/onboarding/steps";
import {
  applyDocumentPreferences,
  DEFAULT_PROFILE_PREFERENCES,
  loadProfilePreferences,
  saveProfilePreferences,
  type ProfilePreferences,
} from "@/data/profileData";
import { Profile, ProfileHeaderActions } from "@/pages/Profile";

export const Route = createFileRoute("/profile")({
  head: () =>
    stepHead(
      "Profile & Settings",
      "Manage astronaut profile details, health score summary, preferences, and mental wellness.",
    ),
  component: ProfileRoute,
});

function ProfileRoute() {
  const [prefs, setPrefs] = useState<ProfilePreferences>(DEFAULT_PROFILE_PREFERENCES);

  useEffect(() => {
    const loaded = loadProfilePreferences();
    setPrefs(loaded);
    applyDocumentPreferences(loaded);
  }, []);

  const handleUpdatePrefs = useCallback((patch: Partial<ProfilePreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      saveProfilePreferences(next);
      applyDocumentPreferences(next);
      return next;
    });
  }, []);

  return (
    <DashboardShell
      hideHeaderTitle
      statusWeekday
      statusSeparator="dot"
      sidebarVariant="profile"
      calmBackdrop
      headerRight={<ProfileHeaderActions notificationsEnabled={prefs.notifications} />}
    >
      <Profile prefs={prefs} onUpdatePrefs={handleUpdatePrefs} />
    </DashboardShell>
  );
}
