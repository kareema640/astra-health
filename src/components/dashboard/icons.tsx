import type { SVGProps } from "react";

/** Filled lungs, as on the breathing-rate card of the dashboard reference. */
export function LungsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden {...props}>
      <path d="M22.4 4h3.2v14.2l5.3 4.1-1.9 2.5-3.4-2.6v.1h-3.2v-.1l-3.4 2.6-1.9-2.5 5.3-4.1Z" />
      <path d="M19.4 14.2c-1.6-2.8-4.8-3.4-7-1.1C8.1 17.6 4 27.7 4 36.6c0 4.6 2.8 7.4 7.2 7.4 3.8 0 6.6-1.4 8.4-3.6 1.4-1.7 1.8-3.8 1.8-6.4V25.4l-3.9 3-2.1-2.7 6-4.6Z" />
      <path d="M28.6 14.2c1.6-2.8 4.8-3.4 7-1.1C39.9 17.6 44 27.7 44 36.6c0 4.6-2.8 7.4-7.2 7.4-3.8 0-6.6-1.4-8.4-3.6-1.4-1.7-1.8-3.8-1.8-6.4V25.4l3.9 3 2.1-2.7-6-4.6Z" />
    </svg>
  );
}

/** Running figure used for Activity. */
export function RunnerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="15.5" cy="3.8" r="1.9" fill="currentColor" stroke="none" />
      <path d="m7.5 9.5 3.6-2.3 3.4 1.6-1.8 4.6 3.3 2.6-1.2 5" />
      <path d="m12.7 13.4-2.6 3.3-4.6.6" />
      <path d="m14.5 8.8 1.9 2.7 3.3.4" />
    </svg>
  );
}
