import type { ReactNode } from "react";

/** A value with its unit, or a muted "Not entered". */
export function valueOr(value: string | null | undefined, unit?: string): ReactNode {
  const v = value?.trim();
  if (!v) return <span className="font-normal text-dash-amber">Not entered</span>;
  return unit ? `${v} ${unit}` : v;
}
