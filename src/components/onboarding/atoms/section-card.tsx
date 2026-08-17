"use client";

import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  hint?: string;
  tone?: "default" | "soft";
  className?: string;
  children: React.ReactNode;
};

export function SectionCard({
  title,
  hint,
  tone = "default",
  className,
  children,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "mb-3.5 rounded-2xl border border-line p-[18px]",
        tone === "soft" ? "bg-card-deep" : "bg-card",
        className,
      )}
    >
      <div
        className={cn(
          "text-[11.5px] font-extrabold uppercase tracking-[0.6px] text-ink-faint",
          hint ? "mb-1" : "mb-3.5",
        )}
      >
        {title}
      </div>
      {hint ? (
        <p className="mb-3.5 text-[12.5px] leading-relaxed text-ink-soft">
          {hint}
        </p>
      ) : null}
      {children}
    </div>
  );
}
