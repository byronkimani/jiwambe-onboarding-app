"use client";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

type PwaInstallSheetProps = {
  open: boolean;
  canInstall?: boolean;
  onClose: () => void;
  onInstall: () => void;
  onDismiss: () => void;
  installing?: boolean;
};

export function PwaInstallSheet({
  open,
  canInstall = true,
  onClose,
  onInstall,
  onDismiss,
  installing = false,
}: PwaInstallSheetProps) {
  function handleDismiss() {
    onDismiss();
    onClose();
  }

  return (
    <Sheet open={open} onClose={handleDismiss}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Install app
        </p>
        <h2 className="mt-2 text-[22px] font-bold leading-tight text-ink">
          Keep Jiwambe Onboarding on your tablet
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Open the desk queue and capture flows in one tap — like a native app,
          without the app store.
        </p>
        {!canInstall ? (
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            On desktop Chrome, use the menu (⋮) →{" "}
            <span className="font-semibold text-ink">Install Jiwambe Onboarding</span>
            .
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          type="button"
          variant="mint"
          className="h-auto w-full rounded-2xl py-4 text-base font-bold"
          disabled={installing || !canInstall}
          onClick={onInstall}
        >
          {installing ? "Adding…" : "Add to home screen"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full rounded-2xl py-3 text-base font-semibold text-ink-soft"
          disabled={installing}
          onClick={handleDismiss}
        >
          Not now
        </Button>
      </div>
    </Sheet>
  );
}
