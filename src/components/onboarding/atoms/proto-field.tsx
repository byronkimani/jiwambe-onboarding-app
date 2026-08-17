"use client";

import { cn } from "@/lib/utils";

type ProtoFieldProps = {
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  id?: string;
  children: React.ReactNode;
};

export function ProtoField({
  label,
  hint,
  required,
  className,
  id,
  children,
}: ProtoFieldProps) {
  return (
    <div className={cn("mb-4", className)}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-soft"
      >
        {label}
        {required ? <span className="text-red"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="mt-1 text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function ProtoInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={cn(
        "jw-tap w-full rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3 text-[15px] text-ink outline-none focus:border-accent focus:ring-[3px] focus:ring-accent-soft",
        props.className,
      )}
    />
  );
}

type ProtoBtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ghost?: boolean;
  small?: boolean;
  danger?: boolean;
};

export function ProtoBtn({
  ghost,
  small,
  danger,
  className,
  children,
  ...props
}: ProtoBtnProps) {
  return (
    <button
      type="button"
      className={cn(
        "jw-tap rounded-[11px] font-bold",
        small ? "px-4 py-2.5 text-[13.5px]" : "px-5 py-3.5 text-[15px]",
        danger
          ? "bg-red text-white disabled:bg-slate-bg disabled:text-ink-faint"
          : ghost
            ? "border-[1.5px] border-line-strong bg-transparent text-ink"
            : "bg-accent text-white disabled:bg-slate-bg disabled:text-ink-faint",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type SelectOption = { value: string; label: string };

type ProtoSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
};

export function ProtoSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
  id,
}: ProtoSelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "jw-tap jw-focus w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3 text-[15px] text-ink outline-none",
        className,
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ProtoTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(
        "jw-tap jw-focus min-h-[84px] w-full resize-y rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3 text-[15px] text-ink outline-none",
        props.className,
      )}
    />
  );
}
