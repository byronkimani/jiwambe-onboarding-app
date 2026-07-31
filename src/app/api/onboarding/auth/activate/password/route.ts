import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ACTIVATION_SESSION_COOKIE,
  clearCookieOptions,
  parseActivationSessionCookie,
} from "@/lib/global/auth/auth-cookies";
import { validateNewPassword } from "@/lib/global/auth/validate-password";
import {
  parseUpstreamJson,
  upstreamOfficerActivatePassword,
} from "@/lib/global/auth/officer-auth-upstream";

const schema = z.object({
  password: z.string().min(1),
  password_confirm: z.string().min(1),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const activation = parseActivationSessionCookie(
    cookieStore.get(ACTIVATION_SESSION_COOKIE)?.value,
  );

  if (!activation) {
    return NextResponse.json({ error: "activation_expired" }, { status: 410 });
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

  const response = await upstreamOfficerActivatePassword(
    activation.activation_session_id,
    parsed.data.password,
    request,
  );

  const data = await parseUpstreamJson<Record<string, unknown>>(response);

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error ?? "activation_expired", message: data.message },
      { status: response.status },
    );
  }

  cookieStore.set(ACTIVATION_SESSION_COOKIE, "", clearCookieOptions());

  return NextResponse.json({ ok: true });
}
