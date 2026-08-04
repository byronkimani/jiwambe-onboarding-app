import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { getCatalogPricingRulesPayload } from "@/lib/onboarding/catalog/pricing-rules";

/** Contract: GET `/v1/field/products/pricing-rules` — same min deposits as quote `minDepositKes`. */
export async function GET(request: Request) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  const upstream = await onboardingUpstream("/v1/field/products/pricing-rules", {
    method: "GET",
  }, request);
  if (upstream instanceof NextResponse) {
    return upstream;
  }
  if (upstream.ok) {
    try {
      const body = (await upstream.json()) as {
        operatingModels?: unknown[];
      };
      if (Array.isArray(body.operatingModels) && body.operatingModels.length > 0) {
        return NextResponse.json(body);
      }
    } catch {
      // fall through to local catalog rules
    }
  }

  return NextResponse.json(getCatalogPricingRulesPayload());
  });
}
