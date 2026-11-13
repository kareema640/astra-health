import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { BrandHeader } from "./BrandHeader";
import { SpaceBackdrop } from "./SpaceBackdrop";
import { COMPACT_WIDTH, STAGE_HEIGHT, STAGE_WIDTH, useStageScale } from "./use-stage-scale";

interface Box {
  left: number;
  top: number;
}

interface AuthSceneProps {
  /** Header position on the 1600×900 artboard. */
  header: Box;
  /** Card position and size on the 1600×900 artboard. */
  card: Box & { width: number; height: number };
  children: ReactNode;
}

/**
 * Full-screen space backdrop with the brand header and a glass card.
 * Desktop renders the reference artboard scaled to fit; small screens stack the pieces.
 */
export function AuthScene({ header, card, children }: AuthSceneProps) {
  const { mode, scale, ready } = useStageScale();

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <SpaceBackdrop mode={mode} />

      {mode === "desktop" ? (
        <div
          className={cn(
            "relative flex h-screen items-center",
            ready ? "stage-fade-in" : "opacity-0",
          )}
        >
          <div
            className="relative shrink-0"
            style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, zoom: scale }}
          >
            <div className="absolute" style={{ left: header.left, top: header.top }}>
              <BrandHeader />
            </div>
            <section
              className="auth-card absolute"
              style={{ left: card.left, top: card.top, width: card.width, height: card.height }}
            >
              {children}
            </section>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "relative flex min-h-screen justify-center py-6",
            ready ? "stage-fade-in" : "opacity-0",
          )}
        >
          <div className="flex flex-col items-start gap-8" style={{ width: COMPACT_WIDTH, zoom: scale }}>
            <div className="pl-2">
              <BrandHeader />
            </div>
            <section
              className="auth-card self-center"
              style={{ width: card.width, height: card.height }}
            >
              {children}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
