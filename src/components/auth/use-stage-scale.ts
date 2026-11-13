import { useEffect, useState } from "react";

/** Reference artboard of the login and signup designs. */
export const STAGE_WIDTH = 1600;
export const STAGE_HEIGHT = 900;
/** Column width (in artboard px) used when the screen is too narrow for the artboard. */
export const COMPACT_WIDTH = 720;

const COMPACT_GUTTER = 24;

export type StageMode = "desktop" | "compact";

export interface StageSize {
  width: number;
  height: number;
  compactWidth: number;
}

const AUTH_STAGE: StageSize = {
  width: STAGE_WIDTH,
  height: STAGE_HEIGHT,
  compactWidth: COMPACT_WIDTH,
};

/**
 * Picks the layout for an artboard screen and the CSS zoom that fits it to the viewport.
 * Desktop scales the whole artboard; compact stacks the pieces in a single scaled column.
 * Starts hidden (`ready: false`) so the first paint never shows the wrong scale.
 */
export function useStageScale(stage: StageSize = AUTH_STAGE) {
  const { width, height, compactWidth } = stage;
  const [state, setState] = useState<{ mode: StageMode; scale: number; ready: boolean }>({
    mode: "desktop",
    scale: 1,
    ready: false,
  });

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const desktop = vw >= 1024 && vw / vh >= 1.15;
      setState(
        desktop
          ? { mode: "desktop", scale: Math.min(vw / width, vh / height), ready: true }
          : {
              mode: "compact",
              scale: Math.min(1, (vw - COMPACT_GUTTER) / compactWidth),
              ready: true,
            },
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [width, height, compactWidth]);

  return state;
}
