import type { ApplicationState } from "@/lib/onboarding/types";
import {
  lifelineIndexForState,
  OFFICER_LIFELINE_STEPS,
} from "@/lib/onboarding/fixtures/state-meta";
import { cn } from "@/lib/utils";

export function LifelineStrip({ state }: { state: ApplicationState }) {
  const idx = lifelineIndexForState(state);
  const shown = OFFICER_LIFELINE_STEPS;

  return (
    <div className="my-3.5 flex flex-wrap items-center gap-1">
      {shown.map((step, i) => {
        const realIdx = i + 1;
        const done = realIdx < idx;
        const current = realIdx === idx;
        const label = step.replace(/_/g, " ");
        return (
          <div key={step} className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  done ? "bg-accent" : current ? "bg-amber" : "bg-line",
                  current && "animate-[pulse-dot_1.6s_infinite]",
                )}
              />
              <span
                className={cn(
                  "font-mono text-[10px] font-semibold tracking-wide",
                  done
                    ? "text-accent-deep"
                    : current
                      ? "text-amber"
                      : "text-ink-faint",
                )}
              >
                {label}
              </span>
            </div>
            {i < shown.length - 1 ? (
              <span
                className={cn(
                  "mx-0.5 h-px w-3.5 shrink-0",
                  done ? "bg-accent" : "bg-line",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
