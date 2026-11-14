import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentType, type InputHTMLAttributes, type SVGProps } from "react";

import { cn } from "@/lib/utils";

import { InfoIcon } from "./icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Responsive per-screen input metrics preserving the reference proportions. */
const SIZES = {
  login: {
    root: "h-[54px] sm:h-[62px]",
    iconSlot: "w-[54px] sm:w-[70px]",
    input: "pl-[4px] text-[17px] sm:pl-[8px] sm:text-[20px]",
    trailing: "right-[18px] sm:right-[22px]",
  },
  signup: {
    root: "h-[52px] sm:h-[58px]",
    iconSlot: "w-[56px] sm:w-[76px]",
    input: "pl-[4px] text-[17px] tracking-[0.01em] sm:pl-[10px] sm:text-[20px]",
    trailing: "right-[16px] sm:right-[19px]",
  },
} as const;

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  icon: Icon;
  iconClassName?: string;
  size: keyof typeof SIZES;
  /** Show a reveal toggle; the value is the icon displayed while the password is hidden. */
  reveal?: "eye" | "eye-off";
  /** Show an info hint at the end of the field. */
  hint?: string;
}

export function AuthField({
  icon: IconCmp,
  iconClassName,
  size,
  reveal,
  hint,
  type,
  className,
  ...inputProps
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const s = SIZES[size];
  const inputType = reveal ? (visible ? "text" : "password") : type;
  const HiddenIcon = reveal === "eye-off" ? EyeOff : Eye;
  const RevealIcon = visible ? (reveal === "eye-off" ? Eye : EyeOff) : HiddenIcon;
  const hasTrailing = Boolean(reveal || hint);

  return (
    <label className={cn("auth-field relative flex w-full items-center", s.root, className)}>
      <span className={cn("flex shrink-0 items-center justify-center text-cream", s.iconSlot)}>
        <IconCmp className={iconClassName} />
      </span>
      <input
        {...inputProps}
        type={inputType}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-placeholder",
          s.input,
          hasTrailing ? "pr-[54px] sm:pr-[64px]" : "pr-[20px] sm:pr-[24px]",
        )}
      />
      {reveal && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-foreground/90 transition-colors hover:text-foreground",
            s.trailing,
          )}
        >
          <RevealIcon className="size-[24px] sm:size-[26px]" strokeWidth={1.8} />
        </button>
      )}
      {hint && (
        <span
          title={hint}
          aria-label={hint}
          className={cn("absolute top-1/2 -translate-y-1/2 text-foreground/60", s.trailing)}
        >
          <InfoIcon className="size-[24px] sm:size-[26px]" />
        </span>
      )}
    </label>
  );
}
