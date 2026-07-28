import { auth } from "@/auth";
import { isOnboardingSession } from "@/lib/global/auth/onboarding-session";
import type { Session } from "next-auth";

export { isOnboardingSession } from "@/lib/global/auth/onboarding-session";

export async function getOnboardingSession(): Promise<Session | null> {
  const session = await auth();
  return isOnboardingSession(session) ? session : null;
}
