import { cn } from "@/lib/utils";

type ProtoTagTone = "req" | "ok" | "info" | "warn";

const toneClass: Record<ProtoTagTone, string> = {
  req: "bg-red-bg text-red",
  ok: "bg-accent-soft text-accent-deep",
  info: "bg-slate-bg text-ink-soft",
  warn: "bg-amber-bg text-amber",
};

export function ProtoTag({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: ProtoTagTone;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[10.5px] font-extrabold tracking-wide",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}
