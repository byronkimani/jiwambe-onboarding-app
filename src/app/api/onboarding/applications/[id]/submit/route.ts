import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import {
  jsonFromUpstream,
  parseUpstreamApplicationResponse,
} from "@/lib/global/onboarding/onboarding-bff-parse";
import { blockingIssuesForSubmit } from "@/lib/onboarding/application-submit-blocking";
import { submitApplicationRequestSchema } from "@/lib/onboarding/schemas/application-schemas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsedBody = submitApplicationRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const currentUpstream = await onboardingUpstream(
    `/onboarding/applications/${encodeURIComponent(id)}`,
    { method: "GET" },
    request,
  );
  if (currentUpstream instanceof NextResponse) {
    return currentUpstream;
  }

  const currentParsed = await parseUpstreamApplicationResponse(currentUpstream);
  if (!currentParsed.ok) {
    return currentParsed.response;
  }

  const blockingIssues = blockingIssuesForSubmit(currentParsed.application);
  if (blockingIssues.length > 0) {
    return NextResponse.json(
      { error: "validation_failed", blockingIssues },
      { status: 422 },
    );
  }

  const upstream = await onboardingUpstream(
    `/onboarding/applications/${encodeURIComponent(id)}/submit`,
    {
      method: "POST",
      body: JSON.stringify(parsedBody.data),
    },
    request,
  );
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  if (!upstream.ok) {
    const json = await jsonFromUpstream(upstream);
    return NextResponse.json(json ?? { error: "upstream_error" }, {
      status: upstream.status,
    });
  }

  const parsed = await parseUpstreamApplicationResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ application: parsed.application });
}
