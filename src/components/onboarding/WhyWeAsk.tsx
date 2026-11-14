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
    <div className="flex h-full flex-col px-[20px] py-[24px] sm:px-[32px] sm:pt-[29px] sm:pb-[33px]">
      <h2 className="text-[20px] leading-[26px] font-bold text-foreground sm:text-[21px] sm:leading-[28px]">
        Why we ask
      </h2>
      <p className="mt-[10px] text-[15px] leading-[23px] text-onb-body sm:mt-[11px] sm:text-[16px] sm:leading-[24.5px]">
        {children}
      </p>
      <div className="mt-[16px] aspect-[4/3] min-h-[210px] overflow-hidden rounded-[16px] border border-onb-tile-border lg:aspect-auto lg:min-h-[260px] lg:flex-1">
        <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
