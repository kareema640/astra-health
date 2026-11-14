import { useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Check, ImageUp } from "lucide-react";

import { cn } from "@/lib/utils";

/** Bold field label with an optional lighter qualifier, e.g. "Sex (assigned at birth)". */
export function FieldLabel({
  children,
  hint,
  htmlFor,
  id,
}: {
  children: ReactNode;
  hint?: ReactNode | undefined;
  htmlFor?: string | undefined;
  id?: string | undefined;
}) {
  const content = (
    <>
      {children}
      {hint && <span className="font-normal text-onb-muted"> {hint}</span>}
    </>
  );
  const className = "block text-[15px] leading-[20px] font-bold text-onb-label";
  return htmlFor ? (
    <label htmlFor={htmlFor} id={id} className={className}>
      {content}
    </label>
  ) : (
    <p id={id} className={className}>
      {content}
    </p>
  );
}

/** Label + control with the 7px rhythm used across the step designs. */
export function Field({
  label,
  hint,
  htmlFor,
  labelId,
  className,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode | undefined;
  htmlFor?: string | undefined;
  labelId?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={htmlFor} id={labelId} hint={hint}>
        {label}
      </FieldLabel>
      <div className="mt-[7px]">{children}</div>
    </div>
  );
}

interface UnitInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Unit text or a unit toggle shown at the end of the field. */
  unit?: ReactNode;
}

export function UnitInput({ unit, className, disabled, ...props }: UnitInputProps) {
  return (
    <div
      className={cn(
        "onb-field flex h-[50px] w-full items-center pr-[14px] sm:h-[52px] sm:pr-[21px]",
        disabled && "opacity-50",
        className,
      )}
    >
      <input
        {...props}
        disabled={disabled}
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent pl-[16px] text-[16px] text-foreground outline-none placeholder:text-onb-placeholder disabled:cursor-not-allowed sm:pl-[23px] sm:text-[17px]"
      />
      {unit && (
        <span className="shrink-0 pl-[10px] text-[14.5px] text-onb-label sm:pl-[12px] sm:text-[15.5px]">
          {unit}
        </span>
      )}
    </div>
  );
}

export interface Option<T extends string> {
  value: T;
  label: ReactNode;
}

/** Inline unit switch inside a field, e.g. "cm ft/in"; the active unit is coral. */
export function UnitToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <span
      role="radiogroup"
      aria-label={label}
      className="flex items-center gap-[11px] sm:gap-[13px]"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "text-[14.5px] transition-colors sm:text-[15.5px]",
              active ? "font-bold text-coral" : "text-onb-label hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </span>
  );
}

const CHIP =
  "onb-chip h-[41px] px-[16px] text-[15.5px] leading-none sm:h-[43px] sm:px-[19px] sm:text-[16.5px]";

/** Single-choice pill row. */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  labelledBy,
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  labelledBy: string;
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-[10px]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={CHIP}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Multi-choice pill row. */
export function MultiChipGroup<T extends string>({
  options,
  values,
  onToggle,
  labelledBy,
}: {
  options: readonly Option<T>[];
  values: readonly T[];
  onToggle: (value: T) => void;
  labelledBy: string;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-[10px]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="checkbox"
          aria-checked={values.includes(o.value)}
          onClick={() => onToggle(o.value)}
          className={CHIP}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Small white checkbox with a text label. */
export function CheckRow({
  checked,
  onChange,
  children,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-[12px] pl-[5px] text-left text-[15px] leading-[20px] text-onb-label sm:text-[15.5px]",
        className,
      )}
    >
      <span
        data-state={checked ? "checked" : "unchecked"}
        className="onb-check size-[18px] shrink-0"
      >
        {checked && <Check className="size-[13px]" strokeWidth={3.4} />}
      </span>
      <span>{children}</span>
    </button>
  );
}

/** Dashed drop area that accepts PNG, JPG or PDF by click or drag-and-drop. */
export function UploadDrop({
  title,
  fileName,
  onFile,
  className,
}: {
  title: string;
  fileName: string | null;
  onFile: (name: string | null) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!/\.(png|jpe?g|pdf)$/i.test(file.name)) return;
    onFile(file.name);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        accept(e.dataTransfer.files[0]);
      }}
      className={cn(
        "onb-dashed relative min-h-[88px] w-full rounded-[14px] transition-colors sm:min-h-[94px]",
        dragging && "bg-tile",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex min-h-[88px] w-full items-center justify-center gap-[12px] rounded-[14px] px-[14px] py-[12px] transition-colors hover:bg-tile sm:min-h-[94px] sm:gap-[16px]",
          fileName && "pr-[78px]",
        )}
      >
        <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[12px] border border-onb-tile-border bg-onb-tile text-onb-label sm:size-[46px]">
          <ImageUp className="size-[21px] sm:size-[23px]" strokeWidth={1.7} />
        </span>
        <span className="min-w-0 text-left sm:text-center">
          <span className="block max-w-full truncate text-[14.5px] leading-[20px] font-bold text-coral sm:max-w-[460px] sm:text-[15.5px]">
            {fileName ?? title}
          </span>
          <span className="block text-[13.5px] leading-[18px] text-onb-label sm:text-[15px] sm:leading-[20px]">
            {fileName ? "Uploaded · click to replace" : "PNG, JPG or PDF"}
          </span>
        </span>
      </button>
      {fileName && (
        <button
          type="button"
          onClick={() => onFile(null)}
          className="onb-skip absolute top-1/2 right-[16px] -translate-y-1/2 text-[14px] sm:right-[22px] sm:text-[14.5px]"
        >
          Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
