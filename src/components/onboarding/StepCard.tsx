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
    <div className="flex h-full flex-col px-[37px] pt-[26px] pb-[30px] compact:h-auto">
      <h1 className="text-[43px] leading-[52px] font-bold tracking-[-0.01em] text-foreground">
        {title} <span className="text-coral">{accent}</span>
      </h1>
      <p className="mt-[10px] text-[17.5px] leading-[24px] text-onb-body">{subtitle}</p>
      <div className="mt-[12px]">{children}</div>
      <div className="mt-auto pt-[36px]">{footer}</div>
    </div>
  );
}
