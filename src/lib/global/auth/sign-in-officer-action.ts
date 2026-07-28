"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { normalizeEmail } from "@/lib/global/auth/normalize-email";
import { extractOtpVerifyDetailsFromUnknown } from "@/lib/global/auth/otp-verify-error";
import {
  OTP_SIGN_IN_UNKNOWN_FAILURE,
  otpSignInFailureFromDetails,
  type OtpSignInResult,
} from "@/lib/global/auth/sign-in-otp-result";

export async function signInWithOtpAction(
  email: string,
  otpSessionId: string,
  code: string,
): Promise<OtpSignInResult> {
  const normalizedEmail = normalizeEmail(email);

  try {
    const result = await signIn("officer-otp", {
      email: normalizedEmail,
      otpSessionId,
      code,
      redirect: false,
    });

    if (result?.error) {
      const details =
        extractOtpVerifyDetailsFromUnknown(result) ??
        extractOtpVerifyDetailsFromUnknown(new Error(result.error));
      if (details) {
        return otpSignInFailureFromDetails(details);
      }
      return OTP_SIGN_IN_UNKNOWN_FAILURE;
    }

    return { ok: true };
  } catch (error) {
    const details = extractOtpVerifyDetailsFromUnknown(error);
    if (details) {
      return otpSignInFailureFromDetails(details);
    }

    if (error instanceof AuthError) {
      return OTP_SIGN_IN_UNKNOWN_FAILURE;
    }

    throw error;
  }
}
