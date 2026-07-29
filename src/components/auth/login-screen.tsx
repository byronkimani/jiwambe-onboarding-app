"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { OfficerLoginStep } from "@/components/auth/officer-login-step";
import { OfficerOtpStep } from "@/components/auth/officer-otp-step";
import { AppRoutes } from "@/lib/global/shared/routes";
import { signInWithOtpAction } from "@/lib/global/auth/sign-in-officer-action";

type Step = "login" | "otp";

function formatOtpError(
  body: { message?: string; retries_remaining?: number },
  fallback: string,
): string {
  const base = body.message ?? fallback;
  if (body.retries_remaining !== undefined) {
    return `${base} (${body.retries_remaining} attempts left)`;
  }
  return base;
}

export function LoginScreen({
  passwordSet,
  sessionExpired,
}: {
  passwordSet?: boolean;
  sessionExpired?: boolean;
}) {
  const [step, setStep] = useState<Step>("login");

  useEffect(() => {
    if (!sessionExpired) return;
    void signOut({ redirect: false });
  }, [sessionExpired]);
  const [email, setEmail] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [resendAvailableInSeconds, setResendAvailableInSeconds] = useState(60);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLoginSuccess(
    nextEmail: string,
    sessionId: string,
    masked: string,
    resendSeconds: number,
  ) {
    setEmail(nextEmail);
    setOtpSessionId(sessionId);
    setMaskedPhone(masked);
    setResendAvailableInSeconds(resendSeconds);
    setStep("otp");
    setOtpError(null);
  }

  async function handleVerify(code: string) {
    setSubmitting(true);
    setOtpError(null);

    const result = await signInWithOtpAction(email, otpSessionId, code);
    setSubmitting(false);

    if (!result.ok) {
      setOtpError(
        formatOtpError(
          result,
          "That code didn’t work. Check the SMS and try again.",
        ),
      );
      return;
    }

    window.location.assign(AppRoutes.desk);
  }

  return (
    <AuthScreenLayout>
      {sessionExpired ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] leading-relaxed text-amber-950">
          Your session expired. Sign in again with your email, password, and SMS
          code.
        </p>
      ) : null}
      {passwordSet ? (
        <p className="mb-4 rounded-xl bg-accent-soft px-3 py-2.5 text-[13px] leading-relaxed text-accent-deep">
          Password set — sign in with your email and new password.
        </p>
      ) : null}
      {step === "login" ? (
        <OfficerLoginStep onSuccess={handleLoginSuccess} />
      ) : (
        <OfficerOtpStep
          key={otpSessionId}
          maskedPhone={maskedPhone}
          otpSessionId={otpSessionId}
          initialResendAvailableInSeconds={resendAvailableInSeconds}
          submitting={submitting}
          error={otpError}
          onBack={() => setStep("login")}
          onVerify={handleVerify}
        />
      )}
    </AuthScreenLayout>
  );
}
