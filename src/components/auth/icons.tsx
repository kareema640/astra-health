import { useId, type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Solid glyphs matching the filled icons in the Astra Health designs. */

export function PersonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <circle cx="12" cy="7" r="4.6" />
      <path d="M3.2 21.5c0-4.6 3.9-7.9 8.8-7.9s8.8 3.3 8.8 7.9v.5H3.2z" />
    </svg>
  );
}

export function AstronautIcon(props: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <mask id={id}>
        <rect width="24" height="24" fill="#fff" />
        <path d="M7.6 8.2c.4-1.9 2.2-3.2 4.4-3.2s4 1.3 4.4 3.2c-1.2.7-2.7 1-4.4 1s-3.2-.3-4.4-1z" fill="#000" />
      </mask>
      <g mask={`url(#${id})`}>
        <circle cx="12" cy="8.4" r="6.4" />
      </g>
      <path d="M3.4 22c0-3.9 2.8-6.6 6.2-7.3a8.6 8.6 0 0 0 4.8 0c3.4.7 6.2 3.4 6.2 7.3z" />
    </svg>
  );
}

export function PersonPlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 26 24" fill="currentColor" aria-hidden {...props}>
      <circle cx="10" cy="7" r="4.6" />
      <path d="M1.4 21.6c0-4.6 3.9-7.9 8.6-7.9 1.7 0 3.3.4 4.6 1.2a6.3 6.3 0 0 0-.6 6.7v.5H1.4z" />
      <path
        d="M20 14.2v7.6M16.2 18h7.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path
        d="M7.6 10.4V7.6a4.4 4.4 0 0 1 8.8 0v2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <mask id={id}>
        <rect width="24" height="24" fill="#fff" />
        <circle cx="12" cy="15.2" r="1.7" fill="#000" />
        <rect x="11.1" y="15.6" width="1.8" height="3.4" rx="0.9" fill="#000" />
      </mask>
      <rect x="4.6" y="10" width="14.8" height="12.4" rx="2.6" mask={`url(#${id})`} />
    </svg>
  );
}

export function EnvelopeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 26 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="1.2" y="1.2" width="23.6" height="17.6" rx="1.6" />
      <path d="M1.8 2l11.2 9 11.2-9M1.8 18.2l8.2-7.4M24.2 18.2 16 10.8" />
    </svg>
  );
}

export function IdCardIcon(props: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 26 22" fill="currentColor" aria-hidden {...props}>
      <mask id={id}>
        <rect width="26" height="22" fill="#fff" />
        <circle cx="8.2" cy="10.4" r="2.4" fill="#000" />
        <path d="M3.9 17.4c0-2.4 1.9-4 4.3-4s4.3 1.6 4.3 4z" fill="#000" />
        <rect x="14.4" y="8.4" width="7.6" height="1.9" rx="0.95" fill="#000" />
        <rect x="14.4" y="12" width="7.6" height="1.9" rx="0.95" fill="#000" />
        <rect x="14.4" y="15.6" width="7.6" height="1.9" rx="0.95" fill="#000" />
      </mask>
      <rect x="0.6" y="3.4" width="24.8" height="18" rx="2.6" mask={`url(#${id})`} />
      <rect x="9.6" y="0.6" width="6.8" height="4.4" rx="1.2" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <mask id={id}>
        <rect width="24" height="24" fill="#fff" />
        <circle cx="12" cy="7.3" r="1.6" fill="#000" />
        <rect x="10.6" y="10.2" width="2.8" height="8" rx="1.2" fill="#000" />
      </mask>
      <circle cx="12" cy="12" r="11" mask={`url(#${id})`} />
    </svg>
  );
}

export function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...props}>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export function MicrosoftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 23 23" aria-hidden {...props}>
      <path fill="#F25022" d="M0 0h11v11H0z" />
      <path fill="#7FBA00" d="M12 0h11v11H12z" />
      <path fill="#00A4EF" d="M0 12h11v11H0z" />
      <path fill="#FFB900" d="M12 12h11v11H12z" />
    </svg>
  );
}
