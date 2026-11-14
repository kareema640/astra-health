import type { ReactNode } from "react";

import { BrandHeader } from "./BrandHeader";
import { SpaceBackdrop } from "./SpaceBackdrop";

interface AuthSceneProps {
  /** Legacy artboard props kept optional for compatibility. */
  header?: { left: number; top: number };
  card?: { left: number; top: number; width: number; height: number };
  children: ReactNode;
}

/**
 * Full-screen space backdrop with the brand header and responsive glowing glass card.
 * Preserves the left-card / right-space-astronaut composition on desktop while stacking smoothly
 * across tablet and mobile viewports.
 */
export function AuthScene({ children }: AuthSceneProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background px-[16px] py-[22px] sm:px-[34px] sm:py-[28px] lg:px-[52px] lg:py-[32px]">
      <SpaceBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-[1460px] flex-1 flex-col gap-[26px] lg:gap-[32px]">
        <BrandHeader />

        <div className="my-auto flex w-full justify-center lg:justify-start lg:pl-[28px] xl:pl-[48px]">
          <section className="auth-card w-full max-w-[600px] lg:max-w-[620px]">{children}</section>
        </div>
      </div>
    </main>
  );
}
