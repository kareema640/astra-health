import { createContext, useContext, useEffect, useState } from "react";

/** The dashboard reference is 16:9; it is authored on a 1600×900 artboard. */
export const DASH_STAGE = { width: 1600, height: 900 } as const;
/** Narrowest column (in artboard px) before the compact layout is scaled down. */
const MIN_COLUMN = 420;
const MAX_COLUMN = 980;
const GUTTER = 24;

export type DashMode = "desktop" | "compact";

export interface DashStage {
  mode: DashMode;
  scale: number;
  /** Column width of the compact layout, in artboard px. */
  columnWidth: number;
  ready: boolean;
}

/**
 * Wide screens get the reference artboard scaled to fit; tablets and phones get a fluid
 * single column that is only scaled down on very narrow phones.
 */
export function useDashboardStage(): DashStage {
  const [state, setState] = useState<DashStage>({
    mode: "desktop",
    scale: 1,
    columnWidth: MIN_COLUMN,
    ready: false,
  });

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw >= 1180 && vw / vh >= 1.15) {
        setState({
          mode: "desktop",
          scale: Math.min(vw / DASH_STAGE.width, vh / DASH_STAGE.height),
          columnWidth: MIN_COLUMN,
          ready: true,
        });
        return;
      }
      const available = vw - GUTTER;
      setState(
        available < MIN_COLUMN
          ? { mode: "compact", scale: available / MIN_COLUMN, columnWidth: MIN_COLUMN, ready: true }
          : {
              mode: "compact",
              scale: 1,
              columnWidth: Math.min(available - 8, MAX_COLUMN),
              ready: true,
            },
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return state;
}

export const DashModeContext = createContext<DashMode>("desktop");

export function useDashMode() {
  return useContext(DashModeContext);
}
