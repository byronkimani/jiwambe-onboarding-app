import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { parseUpstreamApplicationResponse } from "@/lib/global/onboarding/onboarding-bff-parse";

type Params = { params: Promise<{ id: string; documentId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id, documentId } = await params;

  const upstream = await onboardingUpstream(
    `/onboarding/applications/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}/complete`,
    { method: "POST" },
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
