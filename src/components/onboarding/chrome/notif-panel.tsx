"use client";

import { cn } from "@/lib/utils";
import type { OnboardingNotification } from "@/lib/onboarding/fixtures/notifications";

type NotifPanelProps = {
  open: boolean;
  onClose: () => void;
  items: OnboardingNotification[];
  onMarkRead: (id: string) => void;
};

export function NotifPanel({
  open,
  onClose,
  items,
  onMarkRead,
}: NotifPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" onClick={onClose} role="presentation">
      <div
        className="animate-fade-up absolute right-5 top-[68px] max-h-[70vh] w-[360px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-2xl border border-line bg-card p-2 shadow-[0_18px_48px_-12px_rgba(22,24,29,0.28)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Notifications"
      >
        <p className="px-3 pb-1.5 pt-2.5 text-xs font-extrabold uppercase tracking-wide text-ink-faint">
          Notifications
        </p>
        {items.length === 0 ? (
          <p className="px-3 pb-4 text-[13px] text-ink-faint">
            Nothing yet — you&apos;ll see it here when an application comes back
            to you.
          </p>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              type="button"
              className={cn(
                "jw-tap mb-0.5 flex w-full gap-2.5 rounded-xl border-none p-3 text-left",
                n.unread ? "bg-accent-soft" : "bg-transparent",
              )}
              onClick={() => {
                onMarkRead(n.id);
                onClose();
              }}
            >
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  n.unread ? "bg-accent" : "bg-transparent",
                )}
              />
              <span className="flex-1">
                <span className="block text-[13.5px] font-bold text-ink">
                  {n.title}
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-soft">
                  {n.body}
                </span>
                <span className="mt-1 block text-[11px] text-ink-faint">
                  {n.time}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
