"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isInstallFlowResolved,
  isInstallPromptDismissed,
  markInstallPromptDismissed,
} from "@/lib/global/pwa/onboarding-storage";
import { PwaInstallSheet } from "@/components/pwa/pwa-install-sheet";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallCoordinator() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const resolved = isInstallFlowResolved({
      standalone: isStandaloneDisplay(),
      installDismissed: isInstallPromptDismissed(),
    });
    if (resolved) return;
    const t = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferred) {
      setOpen(false);
      return;
    }
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setInstalling(false);
      setOpen(false);
      setDeferred(null);
    }
  }, [deferred]);

  return (
    <PwaInstallSheet
      open={open}
      canInstall={Boolean(deferred)}
      installing={installing}
      onClose={() => setOpen(false)}
      onInstall={() => void handleInstall()}
      onDismiss={() => markInstallPromptDismissed()}
    />
  );
}
