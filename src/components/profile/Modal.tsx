import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-[20px] backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dash-card-calm w-full max-w-[440px] p-[24px] text-foreground shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-[12px]">
          <div>
            <h3 className="text-[20px] font-semibold leading-tight text-foreground">{title}</h3>
            {subtitle && <p className="mt-[4px] text-[13.5px] text-dash-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-foreground/80 transition-colors hover:bg-white/[0.14] hover:text-foreground"
          >
            <X className="size-[18px]" />
          </button>
        </div>
        <div className="mt-[18px]">{children}</div>
      </div>
    </div>
  );
}
