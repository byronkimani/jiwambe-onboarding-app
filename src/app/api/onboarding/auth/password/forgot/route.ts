import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isValidEmailFormat,
  normalizeEmail,
} from "@/lib/global/auth/normalize-email";
import {
  parseUpstreamJson,
  upstreamOfficerPasswordForgot,
} from "@/lib/global/auth/officer-auth-upstream";
import { PASSWORD_RESET_REQUEST_MESSAGE, PASSWORD_RESET_UPSTREAM_UNAVAILABLE_MESSAGE } from "@/lib/global/auth/password-reset-copy";

const forgotSchema = z.object({
  email: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  if (!isValidEmailFormat(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const response = await upstreamOfficerPasswordForgot(email, request);
  const data = await parseUpstreamJson<{ message?: string }>(response);

  if (response.status === 429) {
    return NextResponse.json(
      {
        error: data.error ?? "rate_limited",
        message: data.message ?? "Too many attempts. Try again later.",
      },
      { status: 429 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "upstream_unavailable",
        message: PASSWORD_RESET_UPSTREAM_UNAVAILABLE_MESSAGE,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: data.message ?? PASSWORD_RESET_REQUEST_MESSAGE,
  });
}
