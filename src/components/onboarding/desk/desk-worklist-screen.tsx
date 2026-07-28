"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApplicationState, OnboardingApplication } from "@/lib/onboarding/types";
import { OnboardingTopBar } from "@/components/onboarding/chrome/top-bar";
import { ApplicationFolderCard } from "@/components/onboarding/desk/application-folder-card";
import { DeskBoardView } from "@/components/onboarding/desk/desk-board-view";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";
import { AppRoutes, captureStage } from "@/lib/global/shared/routes";
import { cn } from "@/lib/utils";
import { getSeedApplications } from "@/lib/onboarding/fixtures/seed-applications";

const DEMO_APPLICATIONS = getSeedApplications();

type DeskMode = "queue" | "history" | "drafts";

type Props = {
  mode?: DeskMode;
  initialApplications?: OnboardingApplication[];
};

function filterLive(apps: OnboardingApplication[]) {
  return apps.filter(
    (a) =>
      a.state !== "ACTIVE_LOAN" &&
      a.state !== "DISQUALIFIED" &&
      a.state !== "PAUSED",
  );
}

export function DeskWorklistScreen({
  mode = "queue",
  initialApplications,
}: Props) {
  const router = useRouter();
  const [apps, setApps] = useState<OnboardingApplication[]>(
    () => initialApplications ?? DEMO_APPLICATIONS,
  );
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [loading, setLoading] = useState(initialApplications === undefined);
  const [historyQuery, setHistoryQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch(AppRoutes.apiOnboardingApplications, {
        credentials: "same-origin",
      });
      if (!response.ok) {
        if (!cancelled) {
          setApps(DEMO_APPLICATIONS);
          setLoading(false);
        }
        return;
      }
      const body = (await response.json()) as {
        applications: OnboardingApplication[];
      };
      if (!cancelled) {
        setApps(
          body.applications?.length ? body.applications : DEMO_APPLICATIONS,
        );
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const drafts = useMemo(
    () => apps.filter((a) => a.state === "PAUSED"),
    [apps],
  );
  const doneCount = useMemo(
    () => apps.filter((a) => a.state === "ACTIVE_LOAN").length,
    [apps],
  );
  const live = useMemo(() => filterLive(apps), [apps]);

  const handleDemoAdvance = useCallback((id: string, state: ApplicationState) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, state, since: "Returned just now" } : a,
      ),
    );
  }, []);

  const topBarTitle =
    mode === "history"
      ? "History"
      : mode === "drafts"
        ? "Drafts"
        : undefined;

  if (mode === "history") {
    const done = apps.filter(
      (a) => a.state === "ACTIVE_LOAN" || a.state === "DISQUALIFIED",
    );
    const term = historyQuery.trim().toLowerCase();
    const results = term
      ? done.filter((a) =>
          [a.name, a.id, a.lmsId, a.phone, a.bike?.reg]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(term)),
        )
      : done;

    return (
      <DeskShell topBarTitle="History">
        <div className="animate-fade-up mx-auto max-w-[720px]">
          <h1 className="font-display text-[27px] font-normal text-ink">
            History
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Closed files. Search by name, ID, phone, LMS record, or bike
            registration.
          </p>
          <input
            className="jw-tap mt-4 mb-5 w-full rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3 text-[15px] text-ink outline-none focus:border-accent focus:ring-[3px] focus:ring-accent-soft"
            placeholder="Search closed files…"
            value={historyQuery}
            onChange={(e) => setHistoryQuery(e.target.value)}
          />
          {loading ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : results.length === 0 ? (
            <div className="rounded-[14px] border-[1.5px] border-dashed border-line-strong bg-card-deep p-8 text-center text-[13.5px] text-ink-faint">
              {term ? `Nothing matches "${historyQuery}".` : "No closed files yet."}
            </div>
          ) : (
            results.map((app, i) => (
              <ApplicationFolderCard key={app.id} app={app} index={i} />
            ))
          )}
          <div className="mt-4">
            <ProtoBtn ghost onClick={() => router.push(AppRoutes.desk)}>
              ← Worklist
            </ProtoBtn>
          </div>
        </div>
      </DeskShell>
    );
  }

  if (mode === "drafts") {
    return (
      <DeskShell topBarTitle="Drafts">
        <div className="animate-fade-up mx-auto max-w-[720px]">
          <h1 className="font-display text-[27px] font-normal text-ink">
            Paused drafts
          </h1>
          <p className="mt-1 mb-5 text-sm text-ink-soft">
            Paused files, saved mid-flow. Resume to continue — the TAT clock
            restarts and any released bike is re-assigned at the bike stage.
          </p>
          {loading ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : drafts.length === 0 ? (
            <div className="rounded-[14px] border-[1.5px] border-dashed border-line-strong bg-card-deep p-8 text-center text-[13.5px] text-ink-faint">
              No paused drafts. Files you pause mid-capture land here.
            </div>
          ) : (
            drafts.map((app, i) => (
              <div key={app.id}>
                <ApplicationFolderCard app={app} index={i} />
                {app.pauseReason ? (
                  <div className="-mt-2 mb-4 ml-3 rounded-[10px] bg-amber-bg px-3 py-2 text-[12.5px] leading-relaxed text-ink-soft">
                    <b>Paused:</b> {app.pauseReason}
                  </div>
                ) : null}
              </div>
            ))
          )}
          <div className="mt-4">
            <ProtoBtn ghost onClick={() => router.push(AppRoutes.desk)}>
              ← Worklist
            </ProtoBtn>
          </div>
        </div>
      </DeskShell>
    );
  }

  return (
    <DeskShell topBarTitle={topBarTitle}>
      <div
        className={cn(
          "animate-fade-up mx-auto",
          viewMode === "board" ? "max-w-[1280px]" : "max-w-[720px]",
        )}
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[27px] font-normal text-ink">
              Loan applications
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Every file you&apos;ve opened — pick up whichever one is waiting on
              you.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex rounded-[10px] border border-line bg-card p-[3px]">
              {(
                [
                  ["board", "Board"],
                  ["list", "List"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    "jw-tap cursor-pointer rounded-lg border-none px-3.5 py-1.5 text-[12.5px] font-bold",
                    viewMode === key
                      ? "bg-ink text-white"
                      : "bg-transparent text-ink-soft",
                  )}
                  onClick={() => setViewMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <ProtoBtn onClick={() => router.push(captureStage("readiness"))}>
              + New application
            </ProtoBtn>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2.5">
          <Link
            href={AppRoutes.deskDrafts}
            className={cn(
              "jw-tap flex cursor-pointer items-center gap-2.5 rounded-xl border bg-card px-3.5 py-2.5",
              drafts.length ? "border-amber" : "border-line",
            )}
          >
            <span
              className={cn(
                "font-mono text-[22px] font-bold leading-none",
                drafts.length ? "text-amber" : "text-ink-faint",
              )}
            >
              {drafts.length}
            </span>
            <span className="text-left">
              <span className="block text-[12.5px] font-bold text-ink">
                paused drafts
              </span>
              <span className="block text-xs font-bold text-accent-deep">
                View drafts →
              </span>
            </span>
          </Link>
          <Link
            href={AppRoutes.deskHistory}
            className="jw-tap flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-2.5"
          >
            <span className="font-mono text-[22px] font-bold leading-none text-accent-deep">
              {doneCount}
            </span>
            <span className="text-left">
              <span className="block text-[12.5px] font-bold text-ink">
                completed this month
              </span>
              <span className="block text-xs font-bold text-accent-deep">
                View history →
              </span>
            </span>
          </Link>
        </div>

        {!loading && drafts.length > 0 ? (
          <section className="mb-6" aria-label="Paused drafts">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[13px] font-extrabold uppercase tracking-wide text-ink">
                Paused drafts
              </h2>
              <Link
                href={AppRoutes.deskDrafts}
                className="text-xs font-bold text-accent-deep"
              >
                View all ({drafts.length}) →
              </Link>
            </div>
            <div className="space-y-0">
              {drafts.map((app, i) => (
                <div key={app.id}>
                  <ApplicationFolderCard app={app} compact index={i} />
                  {app.pauseReason ? (
                    <div className="-mt-1 mb-3 ml-2 rounded-[10px] bg-amber-bg px-3 py-2 text-[12px] leading-relaxed text-ink-soft">
                      <b>Paused:</b> {app.pauseReason}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {loading ? (
          <p className="text-sm text-ink-soft">Loading worklist…</p>
        ) : viewMode === "board" ? (
          <DeskBoardView apps={live} onDemoAdvance={handleDemoAdvance} />
        ) : (
          <div>
            {live.map((app, i) => (
              <ApplicationFolderCard key={app.id} app={app} index={i} />
            ))}
            {live.length === 0 ? (
              <div className="rounded-[14px] border-[1.5px] border-dashed border-line-strong bg-card-deep p-8 text-center text-[13.5px] text-ink-faint">
                No open files. Start a new application when you&apos;re with a
                customer.
              </div>
            ) : null}
            {live
              .filter((a) => a.state === "OPS_REVIEW")
              .map((a) => (
                <button
                  key={`${a.id}-demo`}
                  type="button"
                  className="jw-tap mb-2.5 block cursor-pointer rounded-lg border border-dashed border-line-strong bg-transparent px-2.5 py-1.5 text-[11.5px] font-bold text-slate"
                  onClick={() => handleDemoAdvance(a.id, "LMS_CREATED")}
                >
                  ▶ Demo: ops approves {a.id} → LMS
                </button>
              ))}
          </div>
        )}
      </div>
    </DeskShell>
  );
}

function DeskShell({
  children,
  topBarTitle,
}: {
  children: ReactNode;
  topBarTitle?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper">
      <OnboardingTopBar customerName={topBarTitle} />
      <div className="flex flex-1 flex-col overflow-y-auto px-9 py-8">{children}</div>
    </div>
  );
}
