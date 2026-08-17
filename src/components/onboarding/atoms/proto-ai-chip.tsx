"use client";

import { cn } from "@/lib/utils";

type ProtoAiChipProps = {
  children: React.ReactNode;
  className?: string;
};

export function ProtoAiChip({ children, className }: ProtoAiChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-blue-bg px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-blue",
        className,
      )}
    >
      ✦ {children}
    </span>
  );
}
