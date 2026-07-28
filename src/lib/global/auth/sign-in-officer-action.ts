"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import {
  DEMO_OTP_CODE,
  isValidOfficerEmail,
  isValidOfficerPassword,
} from "@/lib/global/auth/demo-credentials";

export type SignInOfficerResult =
  | { ok: true }
  | {
      ok: false;
      error: "invalid_email" | "invalid_credentials" | "invalid_otp" | "unknown";
    };

export async function signInWithOtpAction(
  email: string,
  password: string,
  otp: string,
): Promise<SignInOfficerResult> {
  if (!isValidOfficerEmail(email)) {
    return { ok: false, error: "invalid_email" };
  }

  if (!isValidOfficerPassword(password)) {
    return { ok: false, error: "invalid_credentials" };
  }

  if (otp !== DEMO_OTP_CODE) {
    return { ok: false, error: "invalid_otp" };
  }

  try {
    const result = await signIn("officer-email-otp", {
      email: email.trim().toLowerCase(),
      password,
      otp,
      redirect: false,
    });

    if (result?.error) {
      return { ok: false, error: "unknown" };
    }

    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "unknown" };
    }
    throw error;
  }
}
