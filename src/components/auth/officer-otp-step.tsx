"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ProtoBtn,
  ProtoField,
  ProtoInput,
} from "@/components/onboarding/atoms/proto-field";
import { AppRoutes } from "@/lib/global/shared/routes";

type Props = {
  maskedPhone: string;
  otpSessionId: string;
  initialResendAvailableInSeconds: number;
  submitting?: boolean;
  error?: string | null;
  onBack: () => void;
  onVerify: (code: string) => void | Promise<void>;
};

export function OfficerOtpStep({
  maskedPhone,
  otpSessionId,
  initialResendAvailableInSeconds,
  submitting = false,
  error,
  onBack,
  onVerify,
}: Props) {
  const [code, setCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(
    initialResendAvailableInSeconds,
  );
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const handleResend = useCallback(async () => {
    if (resendSeconds > 0 || resending) return;
    setResending(true);
    setResendError(null);
    setResendMessage(null);

    const response = await fetch(AppRoutes.apiOnboardingAuthOtpResend, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ otp_session_id: otpSessionId }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      resend_available_in_seconds?: number;
    };

    setResending(false);

    if (!response.ok) {
      setResendError(
        data.message ?? "Could not resend the code. Try again or go back.",
      );
      return;
    }

    setResendMessage(data.message ?? "We sent a new code by SMS.");
    setResendSeconds(data.resend_available_in_seconds ?? 60);
  }, [otpSessionId, resendSeconds, resending]);

  const codeValid = code.length === 6;

  return (
    <div>
      <button
        type="button"
        className="jw-tap mb-3.5 text-[13.5px] font-bold text-accent-deep"
        onClick={onBack}
      >
        ← Back
      </button>
      <h1 className="font-display text-[22px] text-ink">One more step</h1>
      <p className="mt-1.5 mb-5 text-[13.5px] leading-relaxed text-ink-soft">
        We sent a 6-digit code by SMS to the registered phone for this account —{" "}
        <b>{maskedPhone}</b>.
      </p>
      <ProtoField label="Verification code" id="otp">
        <ProtoInput
          id="otp"
          inputMode="numeric"
          maxLength={6}
          placeholder="······"
          className="text-center font-mono text-[22px] font-bold tracking-[0.35em]"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
      </ProtoField>
      {error ? (
        <p className="mt-3 text-[13px] font-semibold text-red" role="alert">
          {error}
        </p>
      ) : null}
      {resendMessage ? (
        <p className="mt-3 text-[13px] text-accent-deep" role="status">
          {resendMessage}
        </p>
      ) : null}
      {resendError ? (
        <p className="mt-3 text-[13px] font-semibold text-red" role="alert">
          {resendError}
        </p>
      ) : null}
      <ProtoBtn
        className="mt-6 w-full"
        disabled={!codeValid || submitting}
        onClick={() => void onVerify(code)}
      >
        {submitting ? "Verifying…" : "Verify & sign in"}
      </ProtoBtn>
      <ProtoBtn
        ghost
        className="mt-3 w-full"
        disabled={resendSeconds > 0 || resending}
        onClick={() => void handleResend()}
      >
        {resending
          ? "Sending…"
          : resendSeconds > 0
            ? `Resend code in ${resendSeconds}s`
            : "Resend code"}
      </ProtoBtn>
    </div>
  );
}
