import type { OtpVerifyErrorDetails } from "@/lib/global/auth/otp-verify-error";

export type OtpSignInResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      message?: string;
      retries_remaining?: number;
    };

export function otpSignInFailureFromDetails(
  details: OtpVerifyErrorDetails,
): Extract<OtpSignInResult, { ok: false }> {
  const error =
    details.code === "RATE_LIMITED"
      ? "rate_limited"
      : details.code === "TOO_MANY_ATTEMPTS"
        ? "too_many_attempts"
        : details.code === "SESSION_MISMATCH"
          ? "session_mismatch"
          : details.code === "UPSTREAM_ERROR"
            ? "upstream_error"
            : "invalid_otp";

  return {
    ok: false,
    error,
    message: details.message,
    retries_remaining: details.attemptsRemaining,
  };
}

export const OTP_SIGN_IN_UNKNOWN_FAILURE: Extract<OtpSignInResult, { ok: false }> =
  {
    ok: false,
    error: "unknown",
    message: "Something went wrong. Please try again.",
  };
