import { cn } from "@/lib/utils";

/** Thin rule with a centered label, fading towards the card edges. */
export function AuthDivider({ label, gapClassName }: { label: string; gapClassName: string }) {
  return (
    <div className={cn("flex w-full items-center", gapClassName)}>
      <span aria-hidden className="hairline-l h-px flex-1" />
      <span className="text-foreground/90">{label}</span>
      <span aria-hidden className="hairline-r h-px flex-1" />
    </div>
  );
}
