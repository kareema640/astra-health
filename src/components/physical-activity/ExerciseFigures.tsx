import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

/** White athletic astronaut figure in a lunge-punch pose surrounded by a coral orbit ring. */
export function AthleteOrbitBadge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 116 88"
      fill="none"
      aria-hidden
      className={cn("shrink-0 overflow-visible", className)}
    >
      <defs>
        <linearGradient
          id="pa-orbit-coral"
          x1="8"
          y1="68"
          x2="108"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F0734F" />
          <stop offset="100%" stopColor="#FF8A65" />
        </linearGradient>
      </defs>

      {/* Back portion of coral orbit ring */}
      <path
        d="M22 45C10 56 8 69 20 74C35 80 76 66 98 43C109 31 110 21 101 18"
        stroke="url(#pa-orbit-coral)"
        strokeWidth="4.2"
        strokeLinecap="round"
        opacity="0.92"
      />

      {/* Athletic white figure in lunge-punch pose */}
      <g fill="#FFFFFF">
        {/* Head */}
        <circle cx="62" cy="14" r="6.8" />
        {/* Torso leaning forward */}
        <path d="M55 23C59 22 65 23 68 27L62 46C58 47 52 46 49 42L55 23Z" />
        {/* Back arm bent */}
        <path d="M54 25L41 31L46 41L52 38L49 32L56 29Z" />
        {/* Front punching arm */}
        <path d="M64 25L86 24L90 26L87 30L64 30Z" />
        {/* Front bent leg */}
        <path d="M60 44L75 56L72 74L66 74L68 59L54 48Z" />
        {/* Back extended leg */}
        <path d="M51 44L34 62L25 76L31 78L40 65L57 48Z" />
      </g>

      {/* Front sweeping portion of coral orbit ring */}
      <path
        d="M14 66C18 76 47 73 75 55C93 43 106 29 104 21"
        stroke="url(#pa-orbit-coral)"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Coral flexed muscle arm icon for the Your Progress card. */
export function CoralMuscleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient
          id="pa-muscle-grad"
          x1="8"
          y1="54"
          x2="54"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F0734F" />
          <stop offset="100%" stopColor="#FF8A65" />
        </linearGradient>
      </defs>
      <path
        d="M15 47C11 40 12 27 19 18L24 12C27 9 32 10 34 14C35 17 34 21 31 23L28 26C32 25 36 27 38 30C42 29 48 30 51 35C54 41 51 49 43 52C34 55 21 55 15 47Z"
        fill="url(#pa-muscle-grad)"
      />
      <path
        d="M27 25C24 28 22 33 23 38"
        stroke="#0b2054"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M34 39C38 38 42 39 44 42"
        stroke="#0b2054"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

interface ExerciseFigureProps {
  exerciseId: string;
  animated?: boolean;
  className?: string;
}

/**
 * Light-blue upper/full-body exercise illustrations matching the screenshot.
 * Supports `animated` mode inside the full-screen Workout Player.
 */
export function ExerciseFigure({ exerciseId, animated = false, className }: ExerciseFigureProps) {
  if (exerciseId === "palm-press") {
    return (
      <svg
        viewBox="0 0 160 128"
        fill="none"
        aria-hidden
        className={cn("overflow-visible", className)}
      >
        <defs>
          <linearGradient
            id="pa-fig-blue-1"
            x1="40"
            y1="12"
            x2="115"
            y2="120"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#8AC4FF" />
            <stop offset="100%" stopColor="#4FA3FF" />
          </linearGradient>
        </defs>
        {/* Head & Torso */}
        <circle cx="52" cy="30" r="14" fill="url(#pa-fig-blue-1)" />
        <path
          d="M36 52C36 46 43 44 52 44C61 44 68 48 70 56L72 114H33L36 52Z"
          fill="url(#pa-fig-blue-1)"
          opacity="0.92"
        />
        {/* Back/left arm pressing inward */}
        <g className={animated ? "pa-anim-palm-left" : undefined}>
          <path
            d="M44 56L72 78L94 64L98 51C99 48 103 48 104 51L103 70C102 74 99 77 95 79L71 89C66 91 61 90 57 86L38 69Z"
            fill="#6EB5FF"
          />
        </g>
        {/* Front/right arm pressing inward */}
        <g className={animated ? "pa-anim-palm-right" : undefined}>
          <path
            d="M52 58L78 82L101 66L106 49C107 46 112 47 112 51L109 72C108 77 105 80 100 82L76 93C71 95 65 93 61 89L44 70Z"
            fill="#93CAFF"
          />
        </g>
        {/* Isometric tension pulse between palms when animated */}
        {animated && (
          <g className="pa-anim-tension">
            <circle
              cx="104"
              cy="56"
              r="14"
              stroke="#FF8A65"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
            <path
              d="M84 56H92M116 56H124"
              stroke="#FF8A65"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    );
  }

  if (exerciseId === "arm-curl") {
    return (
      <svg
        viewBox="0 0 160 128"
        fill="none"
        aria-hidden
        className={cn("overflow-visible", className)}
      >
        <defs>
          <linearGradient
            id="pa-fig-blue-2"
            x1="50"
            y1="10"
            x2="110"
            y2="120"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#8AC4FF" />
            <stop offset="100%" stopColor="#4FA3FF" />
          </linearGradient>
        </defs>
        {/* Head */}
        <circle cx="80" cy="27" r="13.5" fill="url(#pa-fig-blue-2)" />
        {/* Neck & Shoulders & Torso */}
        <path
          d="M54 52C57 45 68 42 80 42C92 42 103 45 106 52L101 114H59L54 52Z"
          fill="url(#pa-fig-blue-2)"
          opacity="0.9"
        />
        {/* Left stabilizing arm */}
        <path d="M56 52C49 56 47 68 53 76L79 92C83 94 87 92 88 88L65 71L62 56Z" fill="#69B2FF" />
        {/* Right curling arm (animated) */}
        <g
          className={animated ? "pa-anim-curl" : undefined}
          style={{ transformOrigin: "102px 62px" }}
        >
          <path
            d="M104 52C111 56 113 69 107 77L80 94C76 96 72 93 72 89L95 72L98 56Z"
            fill="#93CAFF"
          />
          <circle cx="77" cy="91" r="5" fill="#BEE0FF" />
        </g>
        {animated && (
          <path
            d="M119 58C125 68 123 82 115 90"
            stroke="#FF8A65"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeDasharray="4 4"
            className="pa-anim-tension"
          />
        )}
      </svg>
    );
  }

  // Core Contraction (or fallback for catalog items)
  return (
    <svg
      viewBox="0 0 180 128"
      fill="none"
      aria-hidden
      className={cn("overflow-visible", className)}
    >
      <defs>
        <linearGradient
          id="pa-fig-blue-3"
          x1="20"
          y1="20"
          x2="160"
          y2="115"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8AC4FF" />
          <stop offset="100%" stopColor="#4FA3FF" />
        </linearGradient>
      </defs>
      {/* Mat / horizon reference line */}
      <path
        d="M20 110H162"
        stroke="#4FA3FF"
        strokeOpacity="0.28"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Torso + Head + Arms (crunching forward when animated) */}
      <g
        className={animated ? "pa-anim-crunch-torso" : undefined}
        style={{ transformOrigin: "84px 96px" }}
      >
        <circle cx="48" cy="36" r="12.5" fill="url(#pa-fig-blue-3)" />
        <path
          d="M44 50C50 48 58 51 64 59L86 88C90 94 86 102 78 103L65 103C56 101 47 89 40 72C36 62 37 53 44 50Z"
          fill="url(#pa-fig-blue-3)"
        />
        {/* Arms reaching/holding behind head or chest */}
        <path
          d="M55 56L72 64L83 56C86 54 90 57 88 61L75 73C71 76 66 76 62 73L49 63Z"
          fill="#9ED0FF"
        />
      </g>

      {/* Bent Knees / Legs */}
      <g
        className={animated ? "pa-anim-crunch-legs" : undefined}
        style={{ transformOrigin: "88px 98px" }}
      >
        <path
          d="M82 93L116 61C122 55 130 57 134 65L152 103C154 107 149 111 144 109L134 105L122 76L91 104C84 107 78 101 82 93Z"
          fill="#78BAFF"
        />
      </g>

      {/* Core engagement curved indicator */}
      <path
        d="M84 62C91 56 101 56 107 63"
        stroke={animated ? "#FF8A65" : "#4FA3FF"}
        strokeWidth="2.6"
        strokeLinecap="round"
        className={animated ? "pa-anim-tension" : undefined}
      />
      <path
        d="M104 56L108 64L100 64"
        stroke={animated ? "#FF8A65" : "#4FA3FF"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
