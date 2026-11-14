import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";

import { avatarById } from "@/components/onboarding/avatars";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { cn } from "@/lib/utils";

/** The user's selected avatar (defaults to the explorer if none was explicitly saved yet). */
export function useSelectedAvatar() {
  const { data } = useOnboarding();
  return avatarById(data.avatar.character);
}

/** Round portrait (head crop) inside the glowing cyan ring. */
export function AvatarPortrait({ size, className }: { size: number; className?: string }) {
  const avatar = useSelectedAvatar();
  return (
    <span
      className={cn(
        "dash-ring relative block shrink-0 overflow-hidden [width:var(--portrait-size)] [height:var(--portrait-size)]",
        className,
      )}
      style={{ "--portrait-size": `${size}px` } as CSSProperties}
    >
      <img
        key={avatar.id}
        src={avatar.image}
        alt={`${avatar.name} avatar`}
        className="absolute top-[7%] left-1/2 w-[112%] max-w-none -translate-x-1/2 duration-300 animate-in fade-in"
      />
    </span>
  );
}

/** Full-body avatar with the two glowing orange/neon orbit rings from the reference. */
export function AvatarFigure({ height, className }: { height: number; className?: string }) {
  const avatar = useSelectedAvatar();

  const rings = [
    { top: "49%", w: "142%", h: "19%", rotate: 9, anim: "dash-orbit-spin" },
    { top: "62%", w: "130%", h: "16%", rotate: 7, anim: "dash-orbit-spin-alt" },
  ];

  return (
    <div
      className={cn("relative aspect-[0.62/1] shrink-0 [height:var(--figure-height)]", className)}
      style={{ "--figure-height": `${height}px` } as CSSProperties}
    >
      {rings.map((r, i) => (
        <span
          key={`back-${i}`}
          aria-hidden
          className={cn("dash-orbit absolute left-1/2", r.anim)}
          style={{
            top: r.top,
            width: r.w,
            height: r.h,
            transform: `translateX(-50%) rotate(${r.rotate}deg)`,
            clipPath: "inset(0 0 50% 0)",
          }}
        />
      ))}
      <img
        key={avatar.id}
        src={avatar.image}
        alt={`${avatar.name} avatar`}
        className="dash-float relative z-10 h-full w-full object-contain object-bottom drop-shadow-[0_14px_26px_oklch(0.15_0.08_260_/_60%)] duration-500 animate-in fade-in zoom-in-95"
      />
      {rings.map((r, i) => (
        <span
          key={`front-${i}`}
          aria-hidden
          className={cn("dash-orbit absolute left-1/2 z-20", r.anim)}
          style={{
            top: r.top,
            width: r.w,
            height: r.h,
            transform: `translateX(-50%) rotate(${r.rotate}deg)`,
            clipPath: "inset(50% 0 0 0)",
          }}
        />
      ))}
    </div>
  );
}

/** Shown wherever the full-body avatar would be when none has been chosen. */
export function ChooseAvatarCard({ className }: { className?: string | undefined }) {
  return (
    <div
      className={cn(
        "dash-card flex w-[320px] flex-col items-center px-[28px] py-[30px] text-center",
        className,
      )}
    >
      <span className="dash-ring flex size-[96px] items-center justify-center">
        <UserRound className="size-[46px] text-dash-ice" strokeWidth={1.6} />
      </span>
      <h2 className="mt-[18px] text-[24px] leading-[30px] font-bold text-foreground">
        Choose Your Avatar
      </h2>
      <p className="mt-[8px] text-[15.5px] leading-[22px] text-dash-muted">
        You haven't picked an astronaut yet. Choose one to see it here and on your profile.
      </p>
      <Link
        to="/onboarding/avatar"
        className="dash-cta mt-[20px] flex h-[48px] items-center justify-center rounded-full px-[28px] text-[16.5px] font-bold"
      >
        Choose avatar
      </Link>
    </div>
  );
}
