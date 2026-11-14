import { Activity } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * Animated glowing cyan ECG (P-Q-R-S-T) waveform scrolling continuously from right to left.
 * Scroll speed adapts smoothly to the current simulated BPM.
 */
export function EcgMonitor({ bpm }: { bpm: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let phase = 0;
    let lastTs = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w <= 0 || h <= 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Normalized single-beat PQRST waveform in [0..1) returning amplitude in [-0.45..1.0].
    const pqrst = (t: number): number => {
      // P wave
      if (t >= 0.1 && t < 0.2) {
        const u = (t - 0.1) / 0.1;
        return 0.15 * Math.sin(u * Math.PI);
      }
      // Q dip
      if (t >= 0.26 && t < 0.29) {
        const u = (t - 0.26) / 0.03;
        return -0.18 * Math.sin(u * Math.PI);
      }
      // R tall spike
      if (t >= 0.29 && t < 0.34) {
        const u = (t - 0.29) / 0.05;
        return u < 0.5 ? (u / 0.5) * 1.0 : ((1 - u) / 0.5) * 1.0;
      }
      // S dip
      if (t >= 0.34 && t < 0.38) {
        const u = (t - 0.34) / 0.04;
        return -0.34 * Math.sin(u * Math.PI);
      }
      // T wave
      if (t >= 0.48 && t < 0.65) {
        const u = (t - 0.48) / 0.17;
        return 0.25 * Math.sin(u * Math.PI);
      }
      // Subtle baseline micro-ripple
      return 0.012 * Math.sin(t * Math.PI * 6);
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      if (w > 0 && h > 0) {
        ctx.clearRect(0, 0, w, h);

        // Advance phase right-to-left scaled by live BPM (72 BPM = baseline speed).
        const beatsPerSec = Math.max(0.7, bpmRef.current / 60);
        const pxPerBeat = 190;
        phase = (phase + dt * beatsPerSec * pxPerBeat) % pxPerBeat;

        const baselineY = h * 0.58;
        const ampScale = h * 0.44;

        // Glow pass + crisp foreground line
        ctx.save();
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const cyclePos = (((x + phase) % pxPerBeat) + pxPerBeat) % pxPerBeat;
          const t = cyclePos / pxPerBeat;
          const y = baselineY - pqrst(t) * ampScale;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2.6;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 14;
        ctx.stroke();

        // Crisp inner core
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#9ff7ff";
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <section
      aria-label="ECG Monitoring"
      className="dash-card flex flex-col rounded-[20px] px-[24px] pt-[14px] pb-[14px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-[12px]">
        <div className="flex items-center gap-[10px]">
          <Activity
            className="size-[26px] text-dash-cyan drop-shadow-[0_0_8px_var(--dash-cyan)]"
            strokeWidth={2.2}
          />
          <h2 className="text-[20px] leading-[24px] font-bold text-foreground">ECG Monitoring</h2>
        </div>

        <div className="flex items-center gap-[8px] text-[15px] font-semibold text-foreground">
          <span
            aria-hidden
            className="size-[11px] rounded-full bg-dash-green shadow-[0_0_10px_var(--dash-green)]"
          />
          <span>Live</span>
        </div>
      </div>

      {/* Grid + Animated Canvas */}
      <div
        className="relative mt-[10px] h-[165px] w-full overflow-hidden rounded-[14px] border border-dash-cyan/30 bg-[oklch(0.18_0.08_263_/_68%)] shadow-[inset_0_0_24px_oklch(0.22_0.09_262_/_60%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(56, 178, 255, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 178, 255, 0.14) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <canvas
          ref={canvasRef}
          aria-label="Animated electrocardiogram signal waveform"
          className="block h-full w-full"
        />
      </div>

      {/* Footer */}
      <div className="mt-[10px] flex flex-wrap items-center justify-between gap-[10px] text-[13.5px] text-dash-ice/90">
        <div className="flex items-center gap-[10px]">
          <span className="inline-flex h-[24px] items-center rounded-[6px] border border-dash-cyan/45 bg-dash-blue/25 px-[8px] text-dash-cyan">
            <Activity className="size-[15px]" strokeWidth={2.2} />
          </span>
          <span className="font-medium">Electrocardiogram Signal (Demo Simulation)</span>
        </div>
        <span className="font-medium tabular-nums text-dash-muted">
          25 mm/s &nbsp;|&nbsp; 10 mm/mV
        </span>
      </div>
    </section>
  );
}
