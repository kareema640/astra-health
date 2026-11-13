import { useState, type ComponentType, type InputHTMLAttributes, type SVGProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

import { InfoIcon } from "./icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Per-screen metrics taken from the reference designs. */
const SIZES = {
  login: {
    root: "h-[64px]",
    iconSlot: "w-[76px]",
    input: "pl-[8px] text-[21px]",
    trailing: "right-[22px]",
  },
  signup: {
    root: "h-[60px]",
    iconSlot: "w-[90px]",
    input: "pl-[15px] text-[22.5px] tracking-[0.01em]",
    trailing: "right-[19px]",
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
          hasTrailing ? "pr-[64px]" : "pr-[24px]",
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
          <RevealIcon className="size-[28px]" strokeWidth={1.8} />
        </button>
      )}
      {hint && (
        <span
          title={hint}
          aria-label={hint}
          className={cn("absolute top-1/2 -translate-y-1/2 text-foreground/60", s.trailing)}
        >
          <InfoIcon className="size-[27px]" />
        </span>
      )}
    </label>
  );
}
