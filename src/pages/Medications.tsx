import { Link } from "@tanstack/react-router";
import { Bell, Pill } from "lucide-react";

import { AvatarPortrait } from "@/components/dashboard/AvatarArt";
import { useNotifications } from "@/components/dashboard/notifications-context";
import { MedicalTable } from "@/components/medications/MedicalTable";
import { SupplementsTable } from "@/components/medications/SupplementsTable";
import { medical, supplements } from "@/data/medicationsData";

/** Header title block: glowing circular capsule icon + "Medications" + subtitle underneath. */
export function MedicationsHeaderTitle() {
  return (
    <div className="flex items-center gap-[16px]">
      <span
        aria-hidden
        className="dash-ring flex size-[62px] shrink-0 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,oklch(0.45_0.16_248)_0%,oklch(0.22_0.1_264)_78%)]"
      >
        <Pill
          className="size-[32px] -rotate-12 text-foreground drop-shadow-[0_0_10px_var(--dash-cyan)]"
          strokeWidth={2}
        />
      </span>
      <div className="min-w-0">
        <h1 className="text-[28px] leading-[32px] font-bold tracking-[-0.005em] text-foreground sm:text-[31px] sm:leading-[34px]">
          Medications
        </h1>
        <p className="mt-[2px] text-[14px] leading-[18px] font-normal text-dash-ice/90 sm:text-[14.5px]">
          Track your medications and stay on schedule{" "}
          <span aria-hidden className="text-dash-ice">
            ♡
          </span>
        </p>
      </div>
    </div>
  );
}

/** Right header actions: bell icon, thin vertical divider, and user's circular avatar. */
export function MedicationsHeaderActions() {
  const { unread } = useNotifications();

  return (
    <div className="flex items-center gap-[16px]">
      <Link
        to="/dashboard/notifications"
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        className="relative flex size-[44px] items-center justify-center rounded-full text-foreground/90 transition-colors hover:bg-dash-cyan/12 hover:text-foreground"
      >
        <Bell className="size-[24px]" strokeWidth={1.8} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute top-[4px] right-[4px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-coral px-[4px] text-[10.5px] font-bold text-white"
          >
            {unread}
          </span>
        )}
      </Link>

      <span aria-hidden className="h-[28px] w-[1px] bg-foreground/30" />

      <Link
        to="/profile"
        aria-label="Profile & Settings"
        className="shrink-0 rounded-full transition-transform hover:scale-105"
      >
        <AvatarPortrait size={58} />
      </Link>
    </div>
  );
}

export function Medications() {
  return (
    <div className="flex w-full flex-1 flex-col gap-[20px]">
      <MedicalTable items={medical} />
      <SupplementsTable items={supplements} />
    </div>
  );
}
