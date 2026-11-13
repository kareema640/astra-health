import type { ReactNode } from "react";

/** Right-hand explainer panel with the step illustration. */
export function WhyWeAsk({
  children,
  image,
  imageAlt,
}: {
  children: ReactNode;
  image: string;
  imageAlt: string;
}) {
  return (
    <div className="flex h-full flex-col px-[32px] pt-[29px] pb-[33px] compact:h-auto">
      <h2 className="text-[21px] leading-[28px] font-bold text-foreground">Why we ask</h2>
      <p className="mt-[11px] text-[16px] leading-[24.5px] text-onb-body">{children}</p>
      <div className="mt-[16px] min-h-0 flex-1 overflow-hidden rounded-[16px] border border-onb-tile-border compact:h-[620px] compact:flex-none">
        <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
