import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamLookupResponse } from "@/lib/global/onboarding/onboarding-bff-parse";
import {
  customerLookupRequestSchema,
  normalizeCustomerLookupRequest,
} from "@/lib/onboarding/schemas/application-schemas";

/** Contract: POST `/customers/search` */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsedBody = customerLookupRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const normalized = normalizeCustomerLookupRequest(parsedBody.data);
  if (!normalized.ok) {
    return NextResponse.json(
      { error: "invalid_body", message: normalized.message },
      { status: 400 },
    );
  }

  const upstream = await onboardingUpstream("/customers/search", {
    method: "POST",
    body: JSON.stringify({
      phone: normalized.phone ?? undefined,
      nationalId: normalized.nationalId ?? null,
    }),
  }, request);
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamLookupResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ matches: parsed.matches });
}
