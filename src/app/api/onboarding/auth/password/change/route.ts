import { NextResponse } from "next/server";
import { z } from "zod";
import {
  parseUpstreamJson,
  upstreamOfficerPasswordChange,
} from "@/lib/global/auth/officer-auth-upstream";
import { requireOnboardingAccessToken } from "@/lib/global/auth/require-onboarding-session";
import { validateNewPassword } from "@/lib/global/auth/validate-password";

const schema = z.object({
  current_password: z.string().min(1),
  password: z.string().min(1),
  password_confirm: z.string().min(1),
});

/** Contract: POST `/onboarding/auth/password/change` (authenticated). */
export async function POST(request: Request) {
  const session = await requireOnboardingAccessToken();
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!parsed.data.current_password.trim()) {
    return NextResponse.json(
      { error: "invalid_body", message: "Current password is required." },
      { status: 400 },
    );
  }

  const passwordCheck = validateNewPassword(
    parsed.data.password,
    parsed.data.password_confirm,
  );
  if (!passwordCheck.ok) {
    return NextResponse.json(
      { error: "weak_password", message: passwordCheck.message },
      { status: 400 },
    );
  }

  const response = await upstreamOfficerPasswordChange(
    session.accessToken,
    parsed.data.current_password,
    parsed.data.password,
    request,
  );

  const data = await parseUpstreamJson<Record<string, unknown>>(response);

  if (!response.ok) {
    return NextResponse.json(
      {
        error: data.error ?? "change_failed",
        message: data.message,
      },
      { status: response.status },
    );
  }

  return NextResponse.json({ ok: true });
}
