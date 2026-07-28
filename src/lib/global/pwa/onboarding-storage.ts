export const PWA_INSTALL_DISMISSED_KEY = "jiwambe_onboarding_pwa_install_dismissed";

function readFlag(storage: Storage, key: string): boolean {
  try {
    return storage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(storage: Storage, key: string, value: boolean): void {
  try {
    if (value) {
      storage.setItem(key, "1");
    } else {
      storage.removeItem(key);
    }
  } catch {
    // Private mode / blocked storage
  }
}

export function isInstallPromptDismissed(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }
  return readFlag(localStorage, PWA_INSTALL_DISMISSED_KEY);
}

export function markInstallPromptDismissed(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  writeFlag(localStorage, PWA_INSTALL_DISMISSED_KEY, true);
}

export function isInstallFlowResolved(input: {
  standalone: boolean;
  installDismissed: boolean;
}): boolean {
  return input.standalone || input.installDismissed;
}
