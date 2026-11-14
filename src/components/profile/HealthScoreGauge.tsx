import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface HealthScoreGaugeProps {
  score: number;
}

const SIZE = 186;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setAnimatedScore(clamped);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 850;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setAnimatedScore(Math.round(clamped * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  const offset = CIRCUMFERENCE * (1 - animatedScore / 100);

  return (
    <section
      aria-label="Health Summary"
      className="dash-card-calm flex flex-col justify-between p-[28px]"
    >
      <div className="flex items-center gap-[12px]">
        <Heart className="size-[25px] shrink-0 text-[#F25C3C]" strokeWidth={2} />
        <h2 className="text-[20px] font-semibold tracking-[-0.005em] text-foreground">
          Health Summary
        </h2>
      </div>

      <div className="my-auto flex items-center justify-center pt-[16px]">
        <div className="relative flex size-[186px] items-center justify-center">
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="-rotate-90"
            role="img"
            aria-label={`Health Score ${clamped} percent`}
          >
            <defs>
              <linearGradient id="health-gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="55%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#93C5FD" />
              </linearGradient>
            </defs>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="url(#health-gauge-grad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{
                filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.45))",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[36px] leading-none font-bold tabular-nums text-foreground">
              {animatedScore}%
            </span>
            <span className="mt-[6px] text-[14.5px] font-normal text-foreground/75">
              Health Score
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
