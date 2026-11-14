import { HeartPulse } from "lucide-react";

import { getExpiryUrgency, type MedicalItem } from "@/data/medicationsData";
import { cn } from "@/lib/utils";

import { StatusPill } from "./StatusPill";

interface MedicalTableProps {
  items: readonly MedicalItem[];
}

export function MedicalTable({ items }: MedicalTableProps) {
  const getExpiryClass = (expiryDate: string) => {
    const urgency = getExpiryUrgency(expiryDate);
    if (urgency === "expired") return "text-red-400 font-medium";
    if (urgency === "soon") return "text-dash-amber font-medium";
    return "text-foreground/90";
  };

  return (
    <section
      aria-label="Medical Inventory"
      className="dash-card w-full rounded-[24px] px-[16px] pt-[18px] pb-[16px] duration-500 animate-in fade-in slide-in-from-bottom-3 sm:px-[24px] sm:pt-[20px]"
    >
      {/* Desktop & Tablet Table */}
      <div className="hidden w-full md:block">
        <div className="grid w-full grid-cols-[1.4fr_1.4fr_0.8fr_1fr_1.3fr_1.1fr] items-center gap-[12px] border-b border-dash-line px-[10px] pb-[12px]">
          <div className="flex items-center gap-[10px]">
            <HeartPulse
              className="size-[26px] shrink-0 text-dash-cyan drop-shadow-[0_0_10px_var(--dash-cyan)]"
              strokeWidth={1.9}
            />
            <h2 className="text-[21px] leading-[24px] font-bold text-foreground">Medical</h2>
          </div>
          <span className="text-[14.5px] font-medium text-dash-ice/80">Medication Name</span>
          <span className="text-[14.5px] font-medium text-dash-ice/80">Dose</span>
          <span className="text-[14.5px] font-medium text-dash-ice/80">Side Effects</span>
          <span className="text-[14.5px] font-medium text-dash-ice/80">Expiry Date</span>
          <span className="sr-only">Status</span>
        </div>

        <div className="divide-y divide-dash-line/70">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid w-full grid-cols-[1.4fr_1.4fr_0.8fr_1fr_1.3fr_1.1fr] items-center gap-[12px] rounded-[10px] px-[10px] py-[11px] text-[15px] transition-colors hover:bg-dash-cyan/[0.08]"
            >
              <span className="truncate font-medium text-foreground">{item.category}</span>
              <span className="truncate text-foreground/95">{item.name}</span>
              <span className="whitespace-nowrap tabular-nums text-foreground/90">{item.dose}</span>
              <span className="truncate text-foreground/90">{item.sideEffects}</span>
              <span
                className={cn("whitespace-nowrap tabular-nums", getExpiryClass(item.expiryDate))}
              >
                Expiry: {item.expiryDate}
              </span>
              <div className="flex justify-end">
                <StatusPill status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="md:hidden">
        <div className="mb-[14px] flex items-center gap-[10px]">
          <HeartPulse
            className="size-[24px] shrink-0 text-dash-cyan drop-shadow-[0_0_10px_var(--dash-cyan)]"
            strokeWidth={1.9}
          />
          <h2 className="text-[20px] font-bold text-foreground">Medical</h2>
        </div>

        <div className="flex flex-col gap-[12px]">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[16px] border border-dash-line bg-white/[0.03] p-[14px] transition-colors hover:bg-dash-cyan/[0.08]"
            >
              <div className="flex items-start justify-between gap-[10px]">
                <div>
                  <div className="text-[12.5px] text-dash-ice/75">{item.category}</div>
                  <div className="mt-[2px] text-[16px] font-semibold text-foreground">
                    {item.name}
                  </div>
                </div>
                <StatusPill status={item.status} />
              </div>

              <div className="mt-[10px] grid grid-cols-2 gap-x-[12px] gap-y-[6px] border-t border-dash-line/60 pt-[10px] text-[13.5px]">
                <div>
                  <span className="text-dash-ice/70">Dose: </span>
                  <span className="tabular-nums text-foreground">{item.dose}</span>
                </div>
                <div>
                  <span className="text-dash-ice/70">Side Effects: </span>
                  <span className="text-foreground">{item.sideEffects}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-dash-ice/70">Expiry Date: </span>
                  <span className={cn("tabular-nums", getExpiryClass(item.expiryDate))}>
                    {item.expiryDate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
