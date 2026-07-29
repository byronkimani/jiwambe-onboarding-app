import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidEmailFormat } from "@/lib/global/auth/normalize-email";
import {
  parseUpstreamJson,
  upstreamOfficerLogin,
} from "@/lib/global/auth/officer-auth-upstream";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success || !isValidEmailFormat(parsed.data.email)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const response = await upstreamOfficerLogin(
    parsed.data.email,
    parsed.data.password,
  );

  const data = await parseUpstreamJson<{
    otp_session_id?: string;
    masked_phone?: string;
    resend_available_in_seconds?: number;
  }>(response);

  if (response.status === 403 && data.error === "account_blocked") {
    return NextResponse.json({ error: "account_blocked" }, { status: 403 });
  }

  if (response.status === 429) {
    return NextResponse.json(
      {
        error: data.error ?? "rate_limited",
        message: data.message ?? "Too many attempts. Try again later.",
        retry_after_seconds: data.retry_after_seconds,
      },
      { status: 429 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error ?? "invalid_credentials", message: data.message },
      { status: response.status === 401 ? 401 : 400 },
    );
  }

  return NextResponse.json({
    otp_session_id: data.otp_session_id,
    masked_phone: data.masked_phone,
    resend_available_in_seconds: data.resend_available_in_seconds ?? 60,
  });
}
