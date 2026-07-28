"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AppRoutes } from "@/lib/global/shared/routes";
import { useOnboardingChrome } from "@/components/onboarding/onboarding-chrome-context";
import { NotifPanel } from "@/components/onboarding/chrome/notif-panel";
import { ProfileSheet } from "@/components/onboarding/chrome/profile-sheet";

type TopBarProps = {
  customerName?: string;
  onBack?: () => void;
};

export function OnboardingTopBar({ customerName, onBack }: TopBarProps) {
  const {
    online,
    setOnline,
    queue,
    officer,
    unread,
    notifications,
    notifOpen,
    setNotifOpen,
    profileOpen,
    setProfileOpen,
    markNotificationRead,
    syncing,
  } = useOnboardingChrome();

  const initials = officer.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <>
      <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-line bg-card px-[22px]">
        <div className="flex items-center gap-3.5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="jw-tap flex h-9 w-9 items-center justify-center rounded-[10px] bg-slate-bg text-base font-bold text-ink"
              aria-label="Back"
            >
              ←
            </button>
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent-deep font-display text-sm font-extrabold text-white"
              aria-hidden
            >
              J
            </div>
          )}
          <div>
            <p className="text-[13.5px] font-bold leading-tight text-ink">
              {customerName || "New application"}
            </p>
            <p className="text-[11px] text-ink-faint">Officer: {officer.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-slate-bg text-base"
            aria-label="Notifications"
          >
            🔔
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-white">
                {unread}
              </span>
            ) : null}
          </button>
          {queue.length > 0 ? (
            <div
              className={cn(
                "animate-fade-up hidden items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs font-bold sm:flex",
                syncing ? "bg-blue-bg text-blue" : "bg-offline-bg text-offline",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-current",
                  online && !syncing ? "" : "animate-pulse",
                )}
              />
              {syncing
                ? "Syncing…"
                : `${queue.length} record${queue.length > 1 ? "s" : ""} queued`}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setOnline(!online)}
            className={cn(
              "jw-tap flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-bold",
              online
                ? "border-line bg-slate-bg text-ink-soft"
                : "border-offline bg-offline-bg text-offline",
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                online ? "bg-mint" : "bg-offline",
              )}
            />
            {online ? "Online" : "Offline (demo)"}
          </button>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="jw-tap flex h-[38px] w-[38px] items-center justify-center rounded-full bg-accent-deep text-[13px] font-extrabold text-white md:hidden"
            title="Profile"
            aria-label="Open profile sheet"
          >
            {initials}
          </button>
          <Link
            href={AppRoutes.deskProfile}
            className="jw-tap hidden h-[38px] w-[38px] items-center justify-center rounded-full bg-accent-deep text-[13px] font-extrabold text-white md:flex"
            title="Profile"
            aria-label="Open profile"
          >
            {initials}
          </Link>
        </div>
      </header>
      <NotifPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
        onMarkRead={markNotificationRead}
      />
      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        officer={officer}
      />
    </>
  );
}
