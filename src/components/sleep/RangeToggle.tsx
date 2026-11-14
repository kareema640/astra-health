import { SLEEP_MAX_DATE, SLEEP_MIN_DATE, type SleepRange } from "@/data/sleepData";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: readonly SleepRange[] = ["7D", "30D", "Custom"];

/** Segmented 7D / 30D / Custom range selector with an inline custom date picker. */
export function RangeToggle({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomChange,
}: {
  value: SleepRange;
  onChange: (next: SleepRange) => void;
  customFrom: string;
  customTo: string;
  onCustomChange: (from: string, to: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      {value === "Custom" && (
        <div className="flex flex-wrap items-center gap-[8px] rounded-full border border-dash-card-border bg-[oklch(0.22_0.09_264_/_75%)] px-[12px] py-[4px] text-[13px] text-foreground">
          <label className="flex items-center gap-[6px]">
            <span className="text-dash-muted">From</span>
            <input
              type="date"
              value={customFrom}
              min={SLEEP_MIN_DATE}
              max={SLEEP_MAX_DATE}
              onChange={(e) => onCustomChange(e.target.value, customTo)}
              className="bg-transparent text-foreground focus:outline-none [color-scheme:dark]"
            />
          </label>
          <span aria-hidden className="text-dash-muted">
            –
          </span>
          <label className="flex items-center gap-[6px]">
            <span className="text-dash-muted">To</span>
            <input
              type="date"
              value={customTo}
              min={SLEEP_MIN_DATE}
              max={SLEEP_MAX_DATE}
              onChange={(e) => onCustomChange(customFrom, e.target.value)}
              className="bg-transparent text-foreground focus:outline-none [color-scheme:dark]"
            />
          </label>
        </div>
      )}

      <div
        role="tablist"
        aria-label="Sleep trend range"
        className="inline-flex items-center rounded-full border border-dash-card-border bg-[oklch(0.22_0.09_263_/_72%)] p-[3px] shadow-[inset_0_1px_0_oklch(1_0_0_/_8%)]"
      >
        {RANGE_OPTIONS.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt)}
              className={cn(
                "cursor-pointer rounded-full px-[18px] py-[6px] text-[14.5px] font-semibold transition-all",
                active
                  ? "dash-nav-active text-foreground"
                  : "text-dash-ice/85 hover:text-foreground",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
