import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamApplicationResponse } from "@/lib/global/onboarding/onboarding-bff-parse";
import { releaseCompleteRequestSchema } from "@/lib/onboarding/schemas/ceremony-schemas";

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

  const parsedBody = releaseCompleteRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const upstream = await onboardingUpstream(
    `/v1/field/applications/${encodeURIComponent(id)}/release`,
    {
      method: "POST",
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
  });
}
