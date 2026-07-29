"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { captureStage } from "@/lib/global/shared/routes";
import { CAPTURE_STAGES } from "@/lib/onboarding/capture/stages";
import { cn } from "@/lib/utils";

type CaptureStepRailProps = {
  current: CaptureStageKey;
  completeMap: Partial<Record<CaptureStageKey, boolean>>;
  unlocked?: boolean;
};

export function CaptureStepRail({
  current,
  completeMap,
  unlocked = true,
}: CaptureStepRailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationRef =
    searchParams.get("application") ?? undefined;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col overflow-y-auto bg-rail transition-[width] duration-[220ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]",
        collapsed ? "w-16 px-2.5 py-5" : "w-[236px] px-3 py-5",
      )}
    >
      <div className="flex-1">
        {CAPTURE_STAGES.map((stage) => {
          const done = Boolean(completeMap[stage.key]);
          const isActive = current === stage.key;
          const locked = !unlocked;
          return (
            <button
              key={stage.key}
              type="button"
              disabled={locked}
              onClick={() =>
                router.push(captureStage(stage.key, applicationRef))
              }
              className={cn(
                "jw-tap mb-0.5 flex w-full items-center gap-3 rounded-xl border-none text-left",
                collapsed ? "justify-center px-0 py-3" : "px-3 py-3",
                isActive ? "bg-rail-card" : "bg-transparent",
                locked ? "cursor-default" : "cursor-pointer",
              )}
            >
              <div
                className={cn(
                  "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full font-mono text-xs font-extrabold",
                  done
                    ? "bg-mint text-accent-deep"
                    : isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white",
                )}
              >
                {done ? "✓" : stage.n}
              </div>
              {!collapsed ? (
                <span
                  className={cn(
                    "whitespace-nowrap text-[13px]",
                    isActive
                      ? "font-bold text-white"
                      : "font-medium text-white/70",
                  )}
                >
                  {stage.label}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        title={collapsed ? "Expand" : "Collapse"}
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          "jw-tap mt-2 flex items-center gap-2.5 rounded-xl border-none bg-white/10 py-2.5 text-xs font-bold text-white/75",
          collapsed ? "justify-center px-0" : "px-3",
        )}
      >
        <span>{collapsed ? "»" : "«"}</span>
        {!collapsed ? "Collapse" : null}
      </button>
    </div>
  );
}
