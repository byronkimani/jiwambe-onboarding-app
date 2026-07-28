import type { ApplicationState } from "@/lib/onboarding/types";
import { STAMP_BY_STATE } from "@/lib/onboarding/desk/folder-visuals";
import { cn } from "@/lib/utils";

export function StampMark({
  state,
  small,
}: {
  state: ApplicationState;
  small?: boolean;
}) {
  const stamp = STAMP_BY_STATE[state] ?? {
    label: state,
    colorClass: "text-kraft-ink border-kraft-ink",
  };
  return (
    <div
      className={cn(
        "shrink-0 -rotate-[7deg] rounded border-2 font-bold uppercase opacity-75",
        stamp.colorClass,
        small ? "px-2 py-0.5 text-[9.5px] tracking-wide" : "px-3 py-1 text-[11px] tracking-widest",
      )}
    >
      {stamp.label}
    </div>
  );
}
