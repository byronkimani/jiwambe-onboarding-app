import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamDepositStkResponse } from "@/lib/global/onboarding/onboarding-bff-parse";
import { depositStkRequestSchema } from "@/lib/onboarding/schemas/deposit-schemas";

/** Contract: POST `/payments/stk` */
export async function POST(request: Request) {
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

  const upstream = await onboardingUpstream("/payments/stk", {
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
}
