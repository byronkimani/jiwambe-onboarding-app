import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { requireOnboardingRefreshToken } from "@/lib/global/auth/require-onboarding-session";
import {
  parseUpstreamJson,
  upstreamOfficerLogout,
} from "@/lib/global/auth/officer-auth-upstream";

export async function POST(request: Request) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  const session = await requireOnboardingRefreshToken();
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await upstreamOfficerLogout(session.refreshToken, request);
  const data = await parseUpstreamJson<Record<string, unknown>>(response);

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error ?? "logout_failed", message: data.message },
      { status: response.status },
    );
  }

  return NextResponse.json({ ok: true });
  });
}
