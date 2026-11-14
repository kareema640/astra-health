import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
        checked ? "bg-[#3B82F6] shadow-[0_0_12px_rgba(59,130,246,0.55)]" : "bg-white/20",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-[22px] rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-0",
        )}
      />
    </button>
  );
}
