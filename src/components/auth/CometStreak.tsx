/** Shooting-star flourish next to the "Welcome Back" headline. */
export function CometStreak({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 230 120" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="comet-tail" x1="0" y1="110" x2="170" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--coral)" stopOpacity="0" />
          <stop offset="0.65" stopColor="var(--coral)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--cream)" />
        </linearGradient>
        <linearGradient id="comet-faint" x1="60" y1="60" x2="200" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--coral)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--coral)" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="comet-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(170 36) scale(26)">
          <stop offset="0" stopColor="var(--cream)" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="var(--ember)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--ember)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M4 114C60 86 118 62 168 38" stroke="url(#comet-tail)" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M76 58C118 40 156 30 214 26" stroke="url(#comet-faint)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M120 104C140 84 156 64 170 42" stroke="url(#comet-faint)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="170" cy="36" r="26" fill="url(#comet-glow)" />
      <path
        d="M170 18c1.2 10.4 4.6 14.8 15 18-10.4 3.2-13.8 7.6-15 18-1.2-10.4-4.6-14.8-15-18 10.4-3.2 13.8-7.6 15-18z"
        fill="var(--cream)"
      />
    </svg>
  );
}
