import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamApplicationResponse } from "@/lib/global/onboarding/onboarding-bff-parse";

type Params = { params: Promise<{ id: string; documentId: string }> };

export async function POST(request: Request, { params }: Params) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  const { id, documentId } = await params;

  const upstream = await onboardingUpstream(
    `/v1/field/applications/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}/complete`,
    { method: "POST" },
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
