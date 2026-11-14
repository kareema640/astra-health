import { ChevronRight } from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

interface SettingRowProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value?: string;
  valueClassName?: string;
  onClick?: () => void;
  rightControl?: ReactNode;
}

export function SettingRow({
  icon: Icon,
  label,
  value,
  valueClassName,
  onClick,
  rightControl,
}: SettingRowProps) {
  const content = (
    <>
      <span className="flex items-center gap-[14px]">
        <Icon className="size-[24px] shrink-0 text-[#F25C3C]" strokeWidth={1.9} />
        <span className="text-[16.5px] font-normal text-foreground">{label}</span>
      </span>
      <span className="flex items-center gap-[12px]">
        {value && (
          <span className={cn("text-[15.5px] font-medium text-foreground/85", valueClassName)}>
            {value}
          </span>
        )}
        {rightControl ?? (
          <ChevronRight
            className="size-[18px] shrink-0 text-foreground/65 transition-transform group-hover:translate-x-[2px]"
            strokeWidth={2}
          />
        )}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full cursor-pointer items-center justify-between rounded-[14px] px-[10px] py-[12px] text-left transition-colors hover:bg-white/[0.06]"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex w-full items-center justify-between rounded-[14px] px-[10px] py-[12px]">
      {content}
    </div>
  );
}
