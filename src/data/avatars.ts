import { AVATARS, avatarById } from "@/components/onboarding/avatars";
import type { OnboardingData } from "@/components/onboarding/onboarding-store";

export type AvatarId = OnboardingData["avatar"]["character"];

export interface AvatarOption {
  id: AvatarId;
  name: string;
  color: string;
  image: string;
}

export const AVATAR_MAP: Record<AvatarId, AvatarOption> = {
  explorer: {
    id: "explorer",
    name: avatarById("explorer").name,
    color: avatarById("explorer").color,
    image: avatarById("explorer").image,
  },
  pilot: {
    id: "pilot",
    name: avatarById("pilot").name,
    color: avatarById("pilot").color,
    image: avatarById("pilot").image,
  },
  scientist: {
    id: "scientist",
    name: avatarById("scientist").name,
    color: avatarById("scientist").color,
    image: avatarById("scientist").image,
  },
  commander: {
    id: "commander",
    name: avatarById("commander").name,
    color: avatarById("commander").color,
    image: avatarById("commander").image,
  },
  medic: {
    id: "medic",
    name: avatarById("medic").name,
    color: avatarById("medic").color,
    image: avatarById("medic").image,
  },
};

export const AVATAR_OPTIONS: readonly AvatarOption[] = AVATARS.map((a) => ({
  id: a.id,
  name: a.name,
  color: a.color,
  image: a.image,
}));

export function resolveAvatarImage(avatarId: AvatarId, customPhoto?: string): string {
  if (customPhoto && customPhoto.trim().length > 0) {
    return customPhoto;
  }
  return AVATAR_MAP[avatarId]?.image ?? AVATAR_MAP.explorer.image;
}
