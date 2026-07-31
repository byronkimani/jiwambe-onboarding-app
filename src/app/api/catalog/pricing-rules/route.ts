import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { getCatalogPricingRulesPayload } from "@/lib/onboarding/catalog/pricing-rules";

/** Contract: GET `/catalog/pricing-rules` — same min deposits as quote `minDepositKes`. */
export async function GET(request: Request) {
  const upstream = await onboardingUpstream("/catalog/pricing-rules", {
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
}
