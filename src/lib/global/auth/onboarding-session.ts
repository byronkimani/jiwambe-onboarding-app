import type { Session } from "next-auth";

/** True when the officer has a usable session for BFF onboarding routes. */
export function isOnboardingSession(session: Session | null): boolean {
  if (!session?.user) return false;
  if (session.error === "RefreshError") return false;
  return Boolean(session.user.id ?? session.agentId ?? session.user.email);
}
