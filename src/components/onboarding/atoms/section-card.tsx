import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  hint,
  tone,
  children,
}: {
  title: string;
  hint?: string;
  tone?: "soft";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-3.5 rounded-2xl border border-line p-[18px]",
        tone === "soft" ? "bg-card-deep" : "bg-card",
      )}
    >
      <p className="text-[11.5px] font-extrabold uppercase tracking-wide text-ink-faint">
        {title}
      </p>
      {hint ? (
        <p className="mb-3.5 mt-1 text-xs leading-relaxed text-ink-soft">
          {hint}
        </p>
      ) : (
        <div className="mb-3.5" />
      )}
      {children}
    </div>
  );
}
