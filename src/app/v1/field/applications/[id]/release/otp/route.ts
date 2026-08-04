import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { jsonFromUpstream } from "@/lib/global/onboarding/onboarding-bff-parse";
import { releaseOtpRequestSchema } from "@/lib/onboarding/schemas/ceremony-schemas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsedBody = releaseOtpRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const upstream = await onboardingUpstream(
    `/v1/field/applications/${encodeURIComponent(id)}/release/otp`,
    {
      method: "POST",
      body: JSON.stringify(parsedBody.data),
    },
    request,
  );
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const json = await jsonFromUpstream(upstream);
  return NextResponse.json(json ?? { ok: true }, { status: upstream.status });
  });
}
