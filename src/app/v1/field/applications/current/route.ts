import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamApplicationResponse } from "@/lib/global/onboarding/onboarding-bff-parse";

export async function GET(request: Request) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  const upstream = await onboardingUpstream("/v1/field/applications/current", {
    method: "GET",
  }, request);
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
  });
}
