import { Link } from "@tanstack/react-router";
import { Bell, User } from "lucide-react";

import { useNotifications } from "@/components/dashboard/notifications-context";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { HealthScoreGauge } from "@/components/profile/HealthScoreGauge";
import { MentalHealthCard } from "@/components/profile/MentalHealthCard";
import { PreferencesCard } from "@/components/profile/PreferencesCard";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { computeHealthScore, type ProfilePreferences } from "@/data/profileData";

export function ProfileHeaderActions({ notificationsEnabled }: { notificationsEnabled: boolean }) {
  const { unread } = useNotifications();
  const badgeCount = notificationsEnabled && unread > 0 ? unread : 0;

  return (
    <div className="flex items-center gap-[18px]">
      <Link
        to="/dashboard/notifications"
        aria-label={badgeCount > 0 ? `Notifications (${badgeCount} unread)` : "Notifications"}
        className="relative flex size-[48px] items-center justify-center rounded-full border border-blue-400/35 bg-white/[0.04] text-foreground transition-colors hover:border-blue-300/65 hover:bg-white/[0.1]"
      >
        <Bell className="size-[22px]" strokeWidth={1.8} />
        {badgeCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-[3px] -right-[3px] flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#EF4444] px-[5px] text-[11.5px] font-bold text-white shadow-sm"
          >
            {badgeCount}
          </span>
        )}
      </Link>

      <span aria-hidden className="h-[28px] w-[1px] bg-foreground/25" />

      <Link
        to="/profile"
        aria-label="Astronaut profile"
        className="flex size-[42px] items-center justify-center rounded-full text-foreground/90 transition-colors hover:bg-white/[0.08] hover:text-foreground"
      >
        <User className="size-[28px]" strokeWidth={1.7} />
      </Link>
    </div>
  );
}

export function Profile({
  prefs,
  onUpdatePrefs,
}: {
  prefs: ProfilePreferences;
  onUpdatePrefs: (patch: Partial<ProfilePreferences>) => void;
}) {
  const { data } = useOnboarding();
  const healthScore = computeHealthScore(data);

  return (
    <div className="grid w-full grid-cols-1 gap-[22px] xl:grid-cols-[1.24fr_1fr] xl:gap-[26px]">
      <div
        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={{ animationDelay: "0ms", animationFillMode: "both" }}
      >
        <ProfileCard />
      </div>

      <div
        className="flex animate-in fade-in slide-in-from-bottom-2 duration-300 [&>*]:flex-1"
        style={{ animationDelay: "70ms", animationFillMode: "both" }}
      >
        <HealthScoreGauge score={healthScore} />
      </div>

      <div
        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={{ animationDelay: "140ms", animationFillMode: "both" }}
      >
        <PreferencesCard prefs={prefs} onUpdate={onUpdatePrefs} />
      </div>

      <div
        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={{ animationDelay: "210ms", animationFillMode: "both" }}
      >
        <MentalHealthCard prefs={prefs} onUpdate={onUpdatePrefs} />
      </div>
    </div>
  );
}
