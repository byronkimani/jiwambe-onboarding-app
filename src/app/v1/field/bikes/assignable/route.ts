import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamInventoryResponse } from "@/lib/global/onboarding/onboarding-bff-parse";

/** Contract: GET `/inventory` */
export async function GET(request: Request) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query ? `/v1/field/bikes/assignable?${query}` : "/v1/field/bikes/assignable";

  const upstream = await onboardingUpstream(path, { method: "GET" }, request);
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamInventoryResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ items: parsed.items, rules: parsed.rules });
  });
}
