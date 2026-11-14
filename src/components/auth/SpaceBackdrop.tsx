import spaceScene from "@/assets/astronaut-space-scene.jpg.asset.json";
import { cn } from "@/lib/utils";

import type { StageMode } from "./use-stage-scale";

/** Full-bleed space artwork shared by every login and health-profile screen. */
export function SpaceBackdrop({ mode }: { mode?: StageMode }) {
  return (
    <img
      src={spaceScene.url}
      alt=""
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 h-full w-full object-cover select-none",
        mode === "compact" ? "object-[72%_center]" : "object-[72%_center] lg:object-center",
      )}
    />
  );
}
