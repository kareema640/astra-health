import { Heart } from "lucide-react";

/** Semicircular segmented cyan gauge displaying the current BPM. */
export function HeartRateGauge({
  bpm,
  min = 40,
  max = 120,
}: {
  bpm: number;
  min?: number;
  max?: number;
}) {
  const segments = 6;
  const clamped = Math.min(max, Math.max(min, bpm));
  const fraction = (clamped - min) / (max - min);
  const activeSegments = Math.max(1, Math.round(fraction * segments));

  const cx = 130;
  const cy = 126;
  const radius = 94;
  const gapDeg = 3.2;
  const totalDeg = 180;
  const segDeg = (totalDeg - gapDeg * (segments - 1)) / segments;

  const polar = (angleDeg: number) => {
    const rad = ((180 - angleDeg) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  };

  const arcPath = (startDeg: number, endDeg: number) => {
    const start = polar(startDeg);
    const end = polar(endDeg);
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  return (
    <div className="relative flex w-[250px] shrink-0 flex-col items-center">
      <svg
        viewBox="0 0 260 144"
        className="w-[240px] overflow-visible"
        role="img"
        aria-label={`Current heart rate gauge: ${bpm} BPM`}
      >
        <defs>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00e5ff" />
          </filter>
        </defs>
        {Array.from({ length: segments }).map((_, i) => {
          const start = i * (segDeg + gapDeg);
          const end = start + segDeg;
          const isActive = i < activeSegments;
          return (
            <path
              key={i}
              d={arcPath(start, end)}
              fill="none"
              stroke={isActive ? "#1fe3ff" : "rgba(95, 155, 235, 0.35)"}
              strokeWidth={18}
              strokeLinecap="butt"
              filter={isActive ? "url(#gaugeGlow)" : undefined}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      {/* Center Heart Icon + BPM + Current label */}
      <div className="-mt-[86px] flex flex-col items-center text-center">
        <Heart
          className="size-[28px] text-dash-ice drop-shadow-[0_0_10px_var(--dash-cyan)]"
          fill="currentColor"
          strokeWidth={0}
        />
        <p className="mt-[4px] flex items-baseline whitespace-nowrap">
          <span className="text-[34px] leading-[38px] font-bold tabular-nums text-foreground">
            {bpm}
          </span>
          <span className="ml-[5px] text-[15px] font-semibold text-dash-ice">BPM</span>
        </p>
        <p className="mt-[2px] text-[14.5px] font-medium text-dash-muted">Current</p>
      </div>
    </div>
  );
}
