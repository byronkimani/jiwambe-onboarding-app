import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamCatalogProductsResponse } from "@/lib/global/onboarding/onboarding-bff-parse";

export async function GET() {
  const upstream = await onboardingUpstream("/onboarding/catalog/products", {
    method: "GET",
  });
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamCatalogProductsResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ products: parsed.products });
}
