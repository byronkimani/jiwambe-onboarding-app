import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamInventoryResponse } from "@/lib/global/onboarding/onboarding-bff-parse";

/** Contract: GET `/inventory` */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query ? `/inventory?${query}` : "/inventory";

  const upstream = await onboardingUpstream(path, { method: "GET" });
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamInventoryResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ items: parsed.items, rules: parsed.rules });
}
