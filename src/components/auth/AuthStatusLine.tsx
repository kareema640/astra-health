import { Loader2 } from "lucide-react";

/**
 * Transient message overlay for the auth cards (server errors, notices).
 * Absolutely positioned so it never shifts the designed layout; styled with
 * the existing coral/foreground palette and glass treatment of the screens.
 */
export function AuthStatusLine({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-[28px] bottom-[10px] z-10 rounded-full bg-[oklch(0.12_0.03_260/0.85)] px-[18px] py-[7px] text-center text-[17px] leading-[22px] text-coral shadow-lg backdrop-blur-sm"
    >
      {message}
    </p>
  );
}

/** Reusable spinner sized like the auth CTA arrow, for busy buttons. */
export function CtaSpinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden className={className ?? "size-[28px] animate-spin"} />;
}
