import commander from "@/assets/avatars/avatar-commander-yellow.png.asset.json";
import explorer from "@/assets/avatars/avatar-explorer-purple.png.asset.json";
import medic from "@/assets/avatars/avatar-medic-teal.png.asset.json";
import pilot from "@/assets/avatars/avatar-pilot-green.png.asset.json";
import scientist from "@/assets/avatars/avatar-scientist-blue.png.asset.json";
import visorClear from "@/assets/onboarding/visor-clear.png.asset.json";
import visorGold from "@/assets/onboarding/visor-gold.png.asset.json";
import visorTinted from "@/assets/onboarding/visor-tinted.png.asset.json";

import type { OnboardingData } from "./onboarding-store";

type Avatar = OnboardingData["avatar"];

export const AVATARS: readonly {
  id: Avatar["character"];
  name: string;
  color: string;
  skin: Avatar["skin"];
  image: string;
}[] = [
  { id: "explorer", name: "Explorer", color: "Purple", skin: "purple", image: explorer.url },
  { id: "pilot", name: "Pilot", color: "Green", skin: "green", image: pilot.url },
  { id: "scientist", name: "Scientist", color: "Blue", skin: "blue", image: scientist.url },
  { id: "commander", name: "Commander", color: "Yellow", skin: "yellow", image: commander.url },
  { id: "medic", name: "Medic", color: "Teal", skin: "teal", image: medic.url },
];

/** Literal class names so Tailwind picks up each swatch color token. */
export const SKINS: readonly { id: Avatar["skin"]; label: string; className: string }[] = [
  { id: "purple", label: "Purple", className: "bg-swatch-purple" },
  { id: "green", label: "Green", className: "bg-swatch-green" },
  { id: "blue", label: "Blue", className: "bg-swatch-blue" },
  { id: "yellow", label: "Yellow", className: "bg-swatch-yellow" },
  { id: "teal", label: "Teal", className: "bg-swatch-teal" },
];

export const ACCENTS: readonly { id: Avatar["accent"]; label: string; className: string }[] = [
  { id: "red", label: "Red", className: "bg-suit-red" },
  { id: "blue", label: "Blue", className: "bg-suit-blue" },
  { id: "gold", label: "Gold", className: "bg-suit-gold" },
  { id: "green", label: "Green", className: "bg-suit-green" },
  { id: "white", label: "White", className: "bg-suit-white" },
];

/** Thumbnails follow the avatar-page reference design. */
export const SUITS: readonly { id: Avatar["suit"]; label: string; image: string }[] = [
  { id: "eva-white", label: "EVA White", image: explorer.url },
  { id: "launch-orange", label: "Launch Orange", image: commander.url },
  { id: "flight-blue", label: "Flight Blue", image: scientist.url },
  { id: "lunar-gray", label: "Lunar Gray", image: pilot.url },
];

function pick<T extends { id: string }>(list: readonly T[], id: T["id"]): T {
  const found = list.find((item) => item.id === id) ?? list[0];
  if (!found) throw new Error("Avatar option list is empty");
  return found;
}

export const avatarById = (id: Avatar["character"]) => pick(AVATARS, id);
export const suitById = (id: Avatar["suit"]) => pick(SUITS, id);
export const visorById = (id: Avatar["visor"]) => pick(VISORS, id);

export const VISORS: readonly {
  id: Avatar["visor"];
  label: string;
  hint: string;
  image: string;
}[] = [
  { id: "clear", label: "Clear", hint: "See your face", image: visorClear.url },
  { id: "gold", label: "Gold", hint: "Sun glare shield", image: visorGold.url },
  { id: "tinted", label: "Tinted", hint: "Deep-space shade", image: visorTinted.url },
];
