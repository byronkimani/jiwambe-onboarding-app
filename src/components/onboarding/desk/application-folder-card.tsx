"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { OnboardingApplication } from "@/lib/onboarding/types";
import { STATE_META } from "@/lib/onboarding/fixtures/state-meta";
import { MODEL_PILL } from "@/lib/onboarding/desk/folder-visuals";
import { formatKes } from "@/lib/onboarding/display/format-kes";
import { IdMini } from "@/components/onboarding/desk/id-mini";
import { StampMark } from "@/components/onboarding/desk/stamp-mark";
import {
  deskApplication,
  deskApplicationAgreement,
  deskApplicationRelease,
  deskApplicationSummary,
} from "@/lib/global/shared/routes";
import { primaryActionForState } from "@/lib/onboarding/application-helpers";
import { cn } from "@/lib/utils";

function FolderDashed() {
  return <div className="my-3 border-t-[1.5px] border-dashed border-line-strong" />;
}

function FolderRow({
  label,
  value,
  tick,
}: {
  label: string;
  value: string;
  tick?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3.5px]">
      <span className="text-[12.5px] font-medium text-ink-soft">{label}</span>
      <span className="text-right font-mono text-[12.5px] font-semibold text-ink">
        {value}
        {tick ? <span className="font-extrabold text-accent"> ✓</span> : null}
      </span>
    </div>
  );
}

function hrefForApp(app: OnboardingApplication): string | null {
  const action = primaryActionForState(app.state);
  if (action === "agreement") return deskApplicationAgreement(app.id);
  if (action === "release") return deskApplicationRelease(app.id);
  if (action === "summary") return deskApplicationSummary(app.id);
  if (action === "resume") return deskApplication(app.id);
  return null;
}

export function ApplicationFolderCard({
  app,
  compact = false,
  index = 0,
}: {
  app: OnboardingApplication;
  compact?: boolean;
  index?: number;
}) {
  const router = useRouter();
  const meta = STATE_META[app.state];
  const pill = MODEL_PILL[app.opModel] ?? MODEL_PILL.FLEET;
  const action = primaryActionForState(app.state);
  const href = hrefForApp(app);
  const actionable =
    Boolean(meta?.action) &&
    app.state !== "ACTIVE_LOAN" &&
    app.state !== "DISQUALIFIED" &&
    app.state !== "PAUSED" &&
    app.state !== "DRAFT";
  const clickable = Boolean(action);

  function handleOpen() {
    if (!clickable) return;
    if (href) router.push(href);
  }

  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="mb-3 flex items-end justify-between gap-2 pl-2.5">
        {clickable && href ? (
          <Link
            href={href}
            className={cn(
              "rounded-t-[9px] border border-b-0 border-kraft-edge bg-kraft font-mono font-bold tracking-wide text-kraft-ink",
              compact ? "px-3 py-1 text-[11px]" : "px-4 py-1.5 text-[12.5px]",
            )}
          >
            {app.id}
          </Link>
        ) : (
          <div
            className={cn(
              "rounded-t-[9px] border border-b-0 border-kraft-edge bg-kraft font-mono font-bold tracking-wide text-kraft-ink",
              compact ? "px-3 py-1 text-[11px]" : "px-4 py-1.5 text-[12.5px]",
            )}
          >
            {app.id}
          </div>
        )}
        {actionable ? (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-t-[7px] bg-accent-deep font-extrabold tracking-wide text-white",
              compact ? "px-2 py-1 text-[9px]" : "px-3 py-1 text-[10px]",
            )}
          >
            <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-mint" />
            ACTION NEEDED
          </div>
        ) : app.state === "PAUSED" || app.state === "DRAFT" ? (
          <div
            className={cn(
              "rounded-t-[7px] bg-amber font-extrabold tracking-wide text-white",
              compact ? "px-2 py-1 text-[9px]" : "px-3 py-1 text-[10px]",
            )}
          >
            RESUME
          </div>
        ) : null}
      </div>

      <div
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? handleOpen : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpen();
                }
              }
            : undefined
        }
        className={cn(
          "rounded-b-xl rounded-tr-xl border border-kraft-edge bg-kraft p-2.5 shadow-[0_2px_10px_rgba(80,64,26,0.10)]",
          clickable && "jw-tap cursor-pointer",
        )}
      >
        <div className="rounded-lg bg-sheet p-4 shadow-[0_1px_3px_rgba(0,0,0,0.07)]">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "font-display text-accent-deep",
                compact ? "text-[15px]" : "text-[17.5px]",
              )}
            >
              Jiwambe
            </span>
            <span
              className={cn(
                "font-extrabold tracking-widest text-ink-faint",
                compact ? "text-[8px]" : "text-[9.5px]",
              )}
            >
              LOAN APPLICATION
            </span>
          </div>
          <div className="mb-3 mt-1.5 h-0.5 rounded-sm bg-accent-deep" />

          <div className={cn("flex items-start", compact ? "gap-3" : "gap-3.5")}>
            <IdMini width={compact ? 66 : 96} />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-display leading-tight text-ink",
                  compact ? "text-[15.5px]" : "text-[19px]",
                )}
              >
                {app.name}
              </p>
              {!compact ? (
                <p className="mt-1 font-mono text-xs text-ink-faint">
                  ID {app.nid}
                </p>
              ) : null}
              <p
                className={cn(
                  "font-mono text-ink-faint",
                  compact ? "mt-0.5 text-[11px]" : "text-xs",
                )}
              >
                {app.phone}
              </p>
              <span
                className={cn(
                  "mt-2 inline-block rounded-full px-2.5 py-1 font-bold",
                  pill.bgClass,
                  pill.fgClass,
                  compact ? "text-[10.5px]" : "text-[11.5px]",
                )}
              >
                {pill.label}
              </span>
            </div>
          </div>

          <FolderDashed />
          <FolderRow label="Product" value={app.product} />
          {!compact ? (
            <FolderRow label="Principal" value={formatKes(app.principal)} />
          ) : null}
          <FolderRow label="Deposit" value={formatKes(app.deposit)} tick />
          <FolderRow label="Daily" value={formatKes(app.daily)} />

          {!compact ? (
            <>
              <FolderDashed />
              <p className="text-[9.5px] font-extrabold tracking-wider text-ink-faint">
                FILED BY
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{app.officer}</p>
              <p className="mt-0.5 text-xs text-ink-faint">{app.officerRole}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="text-ink-faint"
                  aria-hidden
                >
                  <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.4" />
                </svg>
                {app.station}
              </p>
            </>
          ) : null}

          <div
            className={cn(
              "flex items-center justify-between gap-2",
              compact ? "mt-3" : "mt-4",
            )}
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span
                className={cn(
                  "self-start rounded-full px-3 py-1 font-bold",
                  compact ? "text-[10.5px]" : "text-xs",
                  app.flag ? "bg-amber-bg text-amber" : "bg-accent-soft text-accent-deep",
                )}
              >
                {app.flag ?? "clean"}
              </span>
              {!compact && app.since ? (
                <span className="text-[11px] font-semibold text-ink-faint">
                  {app.since}
                </span>
              ) : null}
            </div>
            <StampMark state={app.state} small={compact} />
          </div>

          {!compact ? (
            <>
              <FolderDashed />
              <div className="flex justify-between font-mono text-[11.5px] text-ink-faint">
                <span>{app.submittedAt}</span>
                <span>{app.term}</span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
