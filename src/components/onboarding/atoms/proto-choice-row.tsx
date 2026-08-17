"use client";

import { cn } from "@/lib/utils";

type ChoiceOption = { value: string; label: string };

type ProtoChoiceRowProps = {
  value: string;
  onChange: (value: string) => void;
  options: ChoiceOption[];
  className?: string;
};

export function ProtoChoiceRow({
  value,
  onChange,
  options,
  className,
}: ProtoChoiceRowProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              "jw-tap rounded-[10px] border-[1.5px] px-4 py-[11px] text-sm font-bold",
              selected
                ? "border-accent bg-accent-soft text-accent-deep"
                : "border-line bg-card text-ink-soft",
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
