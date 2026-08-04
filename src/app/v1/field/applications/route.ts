import { NextResponse } from "next/server";
import { runBffRoute } from "@/lib/global/observability/bff-route";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import {
  parseUpstreamApplicationResponse,
  parseUpstreamListResponse,
} from "@/lib/global/onboarding/onboarding-bff-parse";
import {
  createApplicationRequestSchema,
} from "@/lib/onboarding/schemas/application-schemas";

export async function GET(request: Request) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query
    ? `/v1/field/applications?${query}`
    : "/v1/field/applications";

  const upstream = await onboardingUpstream(path, { method: "GET" }, request);
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamListResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json({ applications: parsed.applications });
  });
}

export async function POST(request: Request) {
  return runBffRoute(request, new URL(request.url).pathname, async () => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsedBody = createApplicationRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const upstream = await onboardingUpstream("/v1/field/applications", {
    method: "POST",
    body: JSON.stringify(parsedBody.data),
  }, request);
  if (upstream instanceof NextResponse) {
    return upstream;
  }

  const parsed = await parseUpstreamApplicationResponse(upstream);
  if (!parsed.ok) {
    return parsed.response;
  }

  return NextResponse.json(
    { application: parsed.application },
    { status: upstream.status === 201 ? 201 : 200 },
  );
  });
}
