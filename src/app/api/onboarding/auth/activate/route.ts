import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  activationCookieOptions,
  ACTIVATION_SESSION_COOKIE,
  buildActivationSessionCookieValue,
} from "@/lib/global/auth/auth-cookies";
import {
  parseUpstreamJson,
  upstreamOfficerActivate,
} from "@/lib/global/auth/officer-auth-upstream";

const activateSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = activateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "activation_expired" }, { status: 410 });
  }

  const response = await upstreamOfficerActivate(parsed.data.token);
  const data = await parseUpstreamJson<{
    activation_session_id?: string;
    email_masked?: string;
  }>(response);

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error ?? "activation_expired", message: data.message },
      { status: response.status },
    );
  }

  if (!data.activation_session_id || !data.email_masked) {
    return NextResponse.json({ error: "activation_expired" }, { status: 410 });
  }

  const cookieStore = await cookies();
  cookieStore.set(
    ACTIVATION_SESSION_COOKIE,
    buildActivationSessionCookieValue(
      data.activation_session_id,
      data.email_masked,
    ),
    activationCookieOptions(),
  );

  return NextResponse.json({ email_masked: data.email_masked });
}
