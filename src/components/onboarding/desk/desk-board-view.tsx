import type { OnboardingApplication } from "@/lib/onboarding/types";
import { ApplicationFolderCard } from "@/components/onboarding/desk/application-folder-card";

const BOARD_COLS = [
  { state: "OPS_REVIEW", label: "Ops review" },
  { state: "LMS_CREATED", label: "Agreement" },
  { state: "READY_FOR_RELEASE", label: "Release" },
] as const;

type Props = {
  apps: OnboardingApplication[];
  onDemoAdvance?: (id: string, state: "LMS_CREATED") => void;
};

export function DeskBoardView({ apps, onDemoAdvance }: Props) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
      {BOARD_COLS.map((col) => {
        const rows = apps.filter((a) => {
          if (a.state === col.state) return true;
          if (
            col.state === "LMS_CREATED" &&
            a.state === "AGREEMENT_SIGNED"
          ) {
            return true;
          }
          return false;
        });
        return (
          <div key={col.state}>
            <div className="mb-3 flex items-center gap-2 pl-0.5">
              <span className="text-[12.5px] font-extrabold tracking-wide text-ink">
                {col.label}
              </span>
              <span className="rounded-full border border-line bg-card px-1.5 py-px font-mono text-[11px] font-extrabold text-ink-faint">
                {rows.length}
              </span>
            </div>
            {rows.map((app, i) => (
              <ApplicationFolderCard
                key={app.id}
                app={app}
                compact
                index={i}
              />
            ))}
            {rows.length === 0 ? (
              <div className="rounded-xl border-[1.5px] border-dashed border-line-strong bg-card-deep px-3.5 py-5 text-center text-[12.5px] text-ink-faint">
                Nothing here
              </div>
            ) : null}
            {col.state === "OPS_REVIEW" && onDemoAdvance
              ? rows.map((a) => (
                  <button
                    key={`${a.id}-demo`}
                    type="button"
                    className="jw-tap mb-2.5 mt-1 block w-full cursor-pointer rounded-lg border border-dashed border-line-strong bg-transparent px-2.5 py-1.5 font-sans text-[11px] font-bold text-slate"
                    onClick={() => onDemoAdvance(a.id, "LMS_CREATED")}
                  >
                    ▶ Demo: ops approves {a.id} → LMS
                  </button>
                ))
              : null}
          </div>
        );
      })}
    </div>
  );
}
