"use client";

import { PwaInstallCoordinator } from "@/components/pwa/pwa-install-coordinator";

type ClientPwaShellProps = {
  /** Off in Playwright (`E2E=1`) so install sheets do not block UI interactions. */
  showInstallPrompt?: boolean;
};

export function ClientPwaShell({ showInstallPrompt = true }: ClientPwaShellProps) {
  return <>{showInstallPrompt ? <PwaInstallCoordinator /> : null}</>;
}
