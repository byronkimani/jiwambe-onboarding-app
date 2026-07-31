import { NextResponse } from "next/server";
import { onboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";
import { documentInitRequestSchema } from "@/lib/onboarding/schemas/document-schemas";
import { parseDocumentInitResponse } from "@/lib/onboarding/schemas/document-schemas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsedBody = documentInitRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const upstream = await onboardingUpstream(
    `/onboarding/applications/${encodeURIComponent(id)}/documents/init`,
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
    try {
      const errorBody = await upstream.json();
      return NextResponse.json(errorBody, { status: upstream.status });
    } catch {
      return NextResponse.json({ error: "upstream_error" }, { status: upstream.status });
    }
  }

  try {
    const json = await upstream.json();
    const parsed = parseDocumentInitResponse(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: "upstream_invalid" }, { status: 502 });
    }
    return NextResponse.json(parsed.data);
  } catch {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
