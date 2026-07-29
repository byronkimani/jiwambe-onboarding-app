import { NextResponse } from "next/server";
import { requireOnboardingAccessToken } from "@/lib/global/auth/require-onboarding-session";
import { upstreamRequest } from "@/lib/global/shared/upstream-request";

export type OnboardingUpstreamSession =
  | { ok: true; accessToken: string }
  | { ok: false; response: NextResponse };

export async function requireOnboardingUpstream(): Promise<OnboardingUpstreamSession> {
  const session = await requireOnboardingAccessToken();
  if (!session.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, accessToken: session.accessToken };
}

export async function onboardingUpstream(
  path: string,
  init?: RequestInit,
): Promise<Response | NextResponse> {
  const session = await requireOnboardingUpstream();
  if (!session.ok) {
    return session.response;
  }
  return upstreamRequest(path, init, { accessToken: session.accessToken });
}
