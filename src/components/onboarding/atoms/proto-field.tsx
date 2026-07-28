"use client";

import { cn } from "@/lib/utils";

type ProtoFieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function ProtoField({
  label,
  hint,
  required,
  className,
  children,
}: ProtoFieldProps) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-soft">
        {label}
        {required ? <span className="text-red"> *</span> : null}
      </div>
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
};

export function ProtoBtn({
  ghost,
  small,
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
        ghost
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

export function ExitCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-red/30 bg-red-bg p-4">
      <p className="font-bold text-red">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
