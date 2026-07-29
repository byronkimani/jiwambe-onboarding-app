import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamApplicationResponse } from "@/lib/global/onboarding/onboarding-bff-parse";

export async function GET() {
  const upstream = await onboardingUpstream("/onboarding/applications/current", {
    method: "GET",
  });
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  if (upstream.status === 404) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const parsed = await parseUpstreamApplicationResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ application: parsed.application });
}
