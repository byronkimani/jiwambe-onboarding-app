"use client";

import { useId } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: SheetProps) {
  const titleId = useId();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 max-h-[88vh] w-full max-w-[960px] overflow-auto rounded-t-[26px] bg-card px-6 pb-8 pt-10",
          className,
        )}
        role="dialog"
        aria-modal
        aria-labelledby={title ? titleId : undefined}
      >
        <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-line-strong" />
        <div className="mb-4 flex items-center justify-between">
          {title ? (
            <h2 id={titleId} className="text-base font-extrabold text-ink">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line p-1.5 text-ink-soft tap-active"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
