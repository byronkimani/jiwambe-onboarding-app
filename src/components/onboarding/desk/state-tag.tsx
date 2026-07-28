import type { ApplicationState } from "@/lib/onboarding/types";
import { getStateMeta } from "@/lib/onboarding/fixtures/state-meta";
import { cn } from "@/lib/utils";

export function StateTag({ state }: { state: ApplicationState }) {
  const meta = getStateMeta(state);
  const toneClass =
    meta.tone === "act"
      ? "bg-accent-soft text-accent-deep"
      : meta.tone === "wait"
        ? "bg-amber-bg text-amber"
        : "bg-ink text-mint";

  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold",
        toneClass,
      )}
    >
      {meta.label}
    </span>
  );
}
