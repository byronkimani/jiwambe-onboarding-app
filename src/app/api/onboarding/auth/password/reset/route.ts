import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildResetSessionCookieValue,
  RESET_SESSION_COOKIE,
  resetCookieOptions,
} from "@/lib/global/auth/auth-cookies";
import {
  parseUpstreamJson,
  upstreamOfficerPasswordReset,
} from "@/lib/global/auth/officer-auth-upstream";

const resetSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "reset_expired" }, { status: 410 });
  }

  const response = await upstreamOfficerPasswordReset(parsed.data.token, request);
  const data = await parseUpstreamJson<{
    reset_session_id?: string;
    email_masked?: string;
  }>(response);

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error ?? "reset_expired", message: data.message },
      { status: response.status },
    );
  }

  if (!data.reset_session_id || !data.email_masked) {
    return NextResponse.json({ error: "reset_expired" }, { status: 410 });
  }

  const cookieStore = await cookies();
  cookieStore.set(
    RESET_SESSION_COOKIE,
    buildResetSessionCookieValue(data.reset_session_id, data.email_masked),
    resetCookieOptions(),
  );

  return NextResponse.json({ email_masked: data.email_masked });
}
