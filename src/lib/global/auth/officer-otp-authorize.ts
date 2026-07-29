import { normalizeEmail } from "@/lib/global/auth/normalize-email";
import {
  OtpVerifyError,
  type OtpVerifyErrorDetails,
} from "@/lib/global/auth/otp-verify-error";
import {
  accessTokenExpiresAtMs,
  parseUpstreamJson,
  type UpstreamErrorBody,
  upstreamOfficerOtpVerify,
  type OtpVerifySuccess,
} from "@/lib/global/auth/officer-auth-upstream";

export type OfficerOtpAuthorizeUser = {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
};

export function mapUpstreamOtpVerifyToUser(
  normalizedEmail: string,
  response: Response,
  data: (Partial<OtpVerifySuccess> & UpstreamErrorBody) | Record<string, never>,
): OfficerOtpAuthorizeUser {
  if (response.status === 429) {
    throw otpError({
      code: "RATE_LIMITED",
      message: data.message ?? "Too many attempts. Try again later.",
      attemptsRemaining: data.retries_remaining,
      retryAfterSeconds: data.retry_after_seconds,
    });
  }

  if (!response.ok) {
    if (data.retries_remaining === 0) {
      throw otpError({
        code: "TOO_MANY_ATTEMPTS",
        message: data.message ?? "Too many attempts. Try again later.",
        attemptsRemaining: 0,
      });
    }

    throw otpError({
      code: "INVALID_CODE",
      message: data.message ?? "That code didn’t work. Check the SMS and try again.",
      attemptsRemaining: data.retries_remaining,
    });
  }

  if (
    !data.access_token ||
    !data.refresh_token ||
    !data.officer?.email ||
    !data.officer.name
  ) {
    throw otpError({
      code: "UPSTREAM_ERROR",
      message: "Something went wrong. Please try again.",
    });
  }

  if (normalizeEmail(data.officer.email) !== normalizedEmail) {
    throw otpError({
      code: "SESSION_MISMATCH",
      message: "This code doesn’t match the signed-in email. Start again from the login step.",
    });
  }

  return {
    id: data.officer.email,
    email: data.officer.email,
    name: data.officer.name,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessTokenExpiresAt: accessTokenExpiresAtMs(data.expires_in),
  };
}

export async function authorizeOfficerOtpCredentials(
  email: string,
  otpSessionId: string,
  code: string,
): Promise<OfficerOtpAuthorizeUser> {
  const normalizedEmail = normalizeEmail(email);
  const trimmedCode = code.trim();

  if (!normalizedEmail || !otpSessionId || !trimmedCode) {
    throw otpError({
      code: "INVALID_CODE",
      message: "Enter the code from your SMS.",
    });
  }

  let response: Response;
  try {
    response = await upstreamOfficerOtpVerify(otpSessionId, trimmedCode);
  } catch {
    throw otpError({
      code: "UPSTREAM_ERROR",
      message: "Something went wrong. Please try again.",
    });
  }

  const data = await parseUpstreamJson<OtpVerifySuccess>(response);
  return mapUpstreamOtpVerifyToUser(normalizedEmail, response, data);
}

function otpError(details: OtpVerifyErrorDetails): OtpVerifyError {
  return new OtpVerifyError(details);
}
