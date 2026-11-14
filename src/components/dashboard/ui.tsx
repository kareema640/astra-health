import type { ComponentType, ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export const DASH_BTN =
  "dash-cta inline-flex h-[44px] items-center justify-center gap-[8px] rounded-full px-[22px] text-[15.5px] font-bold";
export const DASH_GHOST =
  "dash-ghost inline-flex h-[44px] items-center justify-center gap-[8px] rounded-full px-[20px] text-[15px] font-medium";

export function DashCard({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return <Tag className={cn("dash-card", className)}>{children}</Tag>;
}

/** Icon + title row at the top of a card. */
export function CardHeading({
  icon: IconCmp,
  title,
  right,
  className,
}: {
  icon?: Icon;
  title: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-[12px]", className)}>
      <h2 className="flex min-w-0 items-center gap-[12px] text-[18px] leading-[24px] font-bold text-foreground">
        {IconCmp && <IconCmp className="size-[28px] shrink-0 text-dash-cyan" />}
        <span className="truncate">{title}</span>
      </h2>
      {right}
    </div>
  );
}

/** Title block at the top of every dashboard section page. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-[16px]">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.01em] text-foreground sm:text-[34px] sm:leading-[42px]">
          {title}
        </h1>
        <p className="mt-[4px] max-w-[760px] text-[15px] leading-[22px] text-dash-muted sm:text-[16.5px] sm:leading-[24px]">
          {subtitle}
        </p>
      </div>
      {actions && <div className="flex flex-wrap gap-[10px]">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon: IconCmp,
  title,
  children,
  action,
  className,
}: {
  icon: Icon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[18px] border-[1.5px] border-dashed border-dash-line px-[24px] py-[28px] text-center",
        className,
      )}
    >
      <IconCmp className="size-[34px] text-dash-ice" strokeWidth={1.7} />
      <p className="mt-[10px] text-[17px] font-bold text-foreground">{title}</p>
      <p className="mt-[4px] max-w-[460px] text-[14.5px] leading-[21px] text-dash-muted">
        {children}
      </p>
      {action && <div className="mt-[14px]">{action}</div>}
    </div>
  );
}

/** Small status chip: entered value, not entered, or no sensor. */
export function SourceTag({ state }: { state: "entered" | "missing" | "no-sensor" }) {
  const map = {
    entered: { label: "Your entry", className: "text-dash-green" },
    missing: { label: "Not entered", className: "text-dash-amber" },
    "no-sensor": { label: "No sensor", className: "text-dash-muted" },
  } as const;
  const t = map[state];
  return (
    <span className={cn("text-[14px] leading-[18px] font-medium", t.className)}>{t.label}</span>
  );
}

/** Label / value pair used in the detail cards. */
export function InfoRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-[16px] border-b border-dash-line py-[11px] last:border-b-0">
      <span className="text-[15px] text-dash-muted">{label}</span>
      <span className="text-right text-[16px] font-medium text-foreground">
        {value}
        {hint && <span className="block text-[12.5px] font-normal text-dash-muted">{hint}</span>}
      </span>
    </div>
  );
}

/**
 * Scale with the typical reference band and a marker at the user's value.
 * Shows where the value sits; it makes no medical judgement.
 */
export function RangeBar({
  min,
  max,
  low,
  high,
  value,
  caption,
}: {
  min: number;
  max: number;
  low: number;
  high: number;
  value: number | null;
  caption: string;
}) {
  const pct = (n: number) => `${Math.min(100, Math.max(0, ((n - min) / (max - min)) * 100))}%`;
  return (
    <div>
      <div className="relative h-[10px] rounded-full bg-dash-track">
        <span
          className="absolute inset-y-0 rounded-full bg-dash-cyan/45"
          style={{ left: pct(low), width: `calc(${pct(high)} - ${pct(low)})` }}
        />
        {value !== null && (
          <span
            className="absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-foreground bg-dash-blue shadow-[0_0_10px_var(--dash-cyan)]"
            style={{ left: pct(value) }}
          />
        )}
      </div>
      <div className="mt-[6px] flex justify-between text-[12px] text-dash-muted">
        <span>{min}</span>
        <span className="text-center">{caption}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
