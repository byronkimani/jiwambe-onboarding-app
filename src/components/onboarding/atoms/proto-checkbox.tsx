"use client";

import { cn } from "@/lib/utils";

type ProtoCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
};

export function ProtoCheckbox({
  checked,
  onChange,
  label,
  className,
}: ProtoCheckboxProps) {
  return (
    <label
      className={cn(
        "jw-tap flex cursor-pointer items-start gap-2.5 rounded-xl border-[1.5px] px-3.5 py-3",
        checked
          ? "border-accent bg-accent-soft"
          : "border-line bg-card-deep",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-[17px] w-[17px] shrink-0 accent-accent"
      />
      <span className="text-[13.5px] font-medium leading-relaxed text-ink">
        {label}
      </span>
    </label>
  );
}
