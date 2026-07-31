import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamApplicationResponse } from "@/lib/global/onboarding/onboarding-bff-parse";
import { patchApplicationRequestSchema } from "@/lib/onboarding/schemas/application-schemas";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const upstream = await onboardingUpstream(
    `/onboarding/applications/${encodeURIComponent(id)}`,
    { method: "GET" },
    request,
  );
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamApplicationResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ application: parsed.application });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsedBody = patchApplicationRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const upstream = await onboardingUpstream(
    `/onboarding/applications/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(parsedBody.data),
    },
    request,
  );
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamApplicationResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ application: parsed.application });
}
