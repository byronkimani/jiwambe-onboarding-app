import { NextResponse } from "next/server";
import { requireOnboardingRefreshToken } from "@/lib/global/auth/require-onboarding-session";
import {
  parseUpstreamJson,
  upstreamOfficerLogout,
} from "@/lib/global/auth/officer-auth-upstream";

export async function POST() {
  const session = await requireOnboardingRefreshToken();
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await upstreamOfficerLogout(session.refreshToken);
  const data = await parseUpstreamJson<Record<string, unknown>>(response);

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error ?? "logout_failed", message: data.message },
      { status: response.status },
    );
  }

  return NextResponse.json({ ok: true });
}
