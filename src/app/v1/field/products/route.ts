import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamCatalogProductsResponse } from "@/lib/global/onboarding/onboarding-bff-parse";

/** Contract: GET `/v1/field/products` */
export async function GET(request: Request) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  const upstream = await onboardingUpstream(
    "/v1/field/products",
    { method: "GET" },
    request,
  );
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamCatalogProductsResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ products: parsed.products });
  });
}
