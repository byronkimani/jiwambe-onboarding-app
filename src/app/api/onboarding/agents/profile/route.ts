import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { getSeedOfficerProfile } from "@/lib/onboarding/fixtures/officer-profile-fixtures";
import { parseOfficerProfileResponse } from "@/lib/onboarding/schemas/officer-profile-schemas";
import { isMockJiwambeApiEnabled } from "@/lib/global/shared/env";

/** Contract: GET `/onboarding/agents/profile` */
export async function GET(request: Request) {
  const upstream = await onboardingUpstream(
    "/onboarding/agents/profile",
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
}
