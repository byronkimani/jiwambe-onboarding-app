import { signOut } from "next-auth/react";
import {
  AppRoutes,
  isProtectedApiPath,
  isPublicApiOnboardingPath,
} from "@/lib/global/shared/routes";

export class BffSessionExpiredError extends Error {
  constructor() {
    super("bff_session_expired");
    this.name = "BffSessionExpiredError";
  }
}

let sessionRecoveryInFlight = false;

function requestPath(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    if (input.startsWith("/")) return input.split("?")[0] ?? input;
    try {
      return new URL(input).pathname;
    } catch {
      return input;
    }
  }
  if (input instanceof URL) return input.pathname;
  return new URL(input.url).pathname;
}

function triggersSessionRecovery(input: RequestInfo | URL): boolean {
  const path = requestPath(input);
  if (!isProtectedApiPath(path)) return false;
  if (isPublicApiOnboardingPath(path)) return false;
  return true;
}

async function recoverExpiredSession(): Promise<void> {
  if (sessionRecoveryInFlight) return;
  sessionRecoveryInFlight = true;
  try {
    await signOut({ redirect: false });
  } catch {
    // Still navigate to login if signOut fails.
  }
  if (typeof window !== "undefined") {
    window.location.assign(`${AppRoutes.home}?sessionExpired=1`);
  }
}

/**
 * Client fetch for authenticated BFF routes. On 401, signs out and redirects to login.
 * Use raw `fetch` for public auth routes (login/OTP) where 401 means invalid credentials.
 */
export async function bffFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, {
    credentials: "same-origin",
    ...init,
  });

  if (response.status === 401 && triggersSessionRecovery(input)) {
    await recoverExpiredSession();
    throw new BffSessionExpiredError();
  }

  return response;
}

/** Test helper */
export function resetBffSessionRecoveryForTests(): void {
  sessionRecoveryInFlight = false;
}
