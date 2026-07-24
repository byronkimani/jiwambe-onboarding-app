import { cn } from "@/lib/utils";

type ShellPlaceholderProps = {
  title: string;
  description: string;
  variant?: "default" | "login";
  children?: React.ReactNode;
};

export function ShellPlaceholder({
  title,
  description,
  variant = "default",
  children,
}: ShellPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        variant === "login" ? "bg-accent-deep text-white" : "bg-background text-ink",
      )}
    >
      <div className="flex flex-1 flex-col px-5 py-8">
        <span
          className={cn(
            "mb-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
            variant === "login"
              ? "bg-white/10 text-white/80"
              : "bg-accent-soft text-accent-deep",
          )}
        >
          Planned
        </span>
        <h1
          className={cn(
            "font-display text-3xl font-semibold leading-tight",
            variant === "login" ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "mt-3 max-w-sm text-sm leading-relaxed",
            variant === "login" ? "text-white/75" : "text-ink-soft",
          )}
        >
          {description}
        </p>
        {children}
      </div>
    </div>
  );
}
