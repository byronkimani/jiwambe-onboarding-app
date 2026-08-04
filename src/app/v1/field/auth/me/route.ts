import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { getSeedOfficerProfile } from "@/lib/onboarding/fixtures/officer-profile-fixtures";
import { parseOfficerProfileResponse } from "@/lib/onboarding/schemas/officer-profile-schemas";
import { isMockJiwambeApiEnabled } from "@/lib/global/shared/env";

/** Contract: GET `/v1/field/auth/me` */
export async function GET(request: Request) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  const upstream = await onboardingUpstream(
    "/v1/field/auth/me",
    { method: "GET" },
    request,
  );
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  if (upstream.ok) {
    try {
      const json = await upstream.json();
      const parsed = parseOfficerProfileResponse(json);
      if (parsed.ok) {
        return NextResponse.json({ profile: parsed.profile });
      }
    } catch {
      // fall through to seed profile in mock mode
    }
  }

  if (isMockJiwambeApiEnabled()) {
    return NextResponse.json({ profile: getSeedOfficerProfile() });
  }

  return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  });
}
