"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { upstreamOfficerLogout } from "@/lib/global/auth/officer-auth-upstream";
import { requireOnboardingRefreshToken } from "@/lib/global/auth/require-onboarding-session";
import { AppRoutes } from "@/lib/global/shared/routes";

/** Server-side logout (upstream revoke + Auth.js). Prefer client SignOutButton for reliable cookie clearing. */
export async function logoutOfficerAction(): Promise<void> {
  const session = await requireOnboardingRefreshToken();
  if (session.ok) {
    await upstreamOfficerLogout(session.refreshToken);
  }
  await signOut({ redirectTo: AppRoutes.home });
  redirect(AppRoutes.home);
}
