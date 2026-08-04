import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamDepositStkResponse } from "@/lib/global/onboarding/onboarding-bff-parse";
import { depositStkRequestSchema } from "@/lib/onboarding/schemas/deposit-schemas";

/** Contract: POST `/v1/field/payments/stk` */
export async function POST(request: Request) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsedBody = depositStkRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const upstream = await onboardingUpstream("/v1/field/payments/stk", {
    method: "POST",
    body: JSON.stringify(parsedBody.data),
  }, request);
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamDepositStkResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json(parsed.body);
  });
}
