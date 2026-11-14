import type { ReactNode } from "react";

interface StepCardProps {
  title: string;
  /** Coral second half of the headline. */
  accent: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

/** Headline, intro line, form body and the pinned Back / Skip / Continue row. */
export function StepCard({ title, accent, subtitle, footer, children }: StepCardProps) {
  return (
    <div className="flex h-full flex-col px-[20px] pt-[22px] pb-[24px] sm:px-[32px] sm:pt-[26px] sm:pb-[28px] lg:px-[37px] lg:pb-[30px]">
      <h1 className="text-[30px] leading-[36px] font-bold tracking-[-0.01em] text-foreground sm:text-[38px] sm:leading-[46px] lg:text-[43px] lg:leading-[52px]">
        {title} <span className="text-coral">{accent}</span>
      </h1>
      <p className="mt-[8px] text-[15.5px] leading-[22px] text-onb-body sm:mt-[10px] sm:text-[17.5px] sm:leading-[24px]">
        {subtitle}
      </p>
      <div className="mt-[16px]">{children}</div>
      <div className="mt-auto pt-[28px] sm:pt-[34px]">{footer}</div>
    </div>
  );
}
