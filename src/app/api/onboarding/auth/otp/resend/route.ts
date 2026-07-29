import { NextResponse } from "next/server";
import { z } from "zod";
import {
  parseUpstreamJson,
  upstreamOfficerOtpResend,
} from "@/lib/global/auth/officer-auth-upstream";

const schema = z.object({
  otp_session_id: z.string().min(1),
});

export async function POST(request: Request) {
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

  const response = await upstreamOfficerOtpResend(parsed.data.otp_session_id);
  const data = await parseUpstreamJson<{
    resend_available_in_seconds?: number;
    message?: string;
  }>(response);

  if (!response.ok) {
    return NextResponse.json(
      {
        error: data.error ?? "otp_expired",
        message: data.message,
      },
      { status: response.status },
    );
  }

  return NextResponse.json({
    resend_available_in_seconds: data.resend_available_in_seconds ?? 60,
    message: data.message,
  });
}
