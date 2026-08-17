"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ProtoBtn,
  ProtoField,
  ProtoInput,
} from "@/components/onboarding/atoms/proto-field";
import { AppRoutes } from "@/lib/global/shared/routes";
import {
  emailFormatErrorMessage,
  isValidEmailFormat,
  normalizeEmail,
} from "@/lib/global/auth/normalize-email";
import {
  PASSWORD_MIN_LENGTH,
  passwordLengthErrorMessage,
} from "@/lib/global/auth/validate-password";

type Props = {
  onSuccess: (
    email: string,
    otpSessionId: string,
    maskedPhone: string,
    resendAvailableInSeconds: number,
  ) => void;
};

export function OfficerLoginStep({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailShowValidation, setEmailShowValidation] = useState(false);
  const [passwordShowValidation, setPasswordShowValidation] = useState(false);

  const emailInlineError = emailShowValidation
    ? emailFormatErrorMessage(email)
    : null;
  const passwordInlineError = passwordShowValidation
    ? passwordLengthErrorMessage(password)
    : null;
  const emailValid = isValidEmailFormat(email);
  const passwordValid = password.length >= PASSWORD_MIN_LENGTH;
  const canSubmit = emailValid && passwordValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailShowValidation(true);
    setPasswordShowValidation(true);
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    const response = await fetch(AppRoutes.apiOnboardingAuthLogin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email: normalizeEmail(email),
        password,
      }),
    });

    setSubmitting(false);

    if (response.status === 403) {
      window.location.href = AppRoutes.accountBlocked;
      return;
    }

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      otp_session_id?: string;
      masked_phone?: string;
      resend_available_in_seconds?: number;
    };

    if (response.status === 429) {
      setError(
        data.message ?? "Too many attempts. Try again later.",
      );
      return;
    }

    if (!response.ok) {
      setError(
        data.message ??
          "Email or password didn’t match. Try again or contact support.",
      );
      return;
    }

    if (!data.otp_session_id || !data.masked_phone) {
      setError("Could not start sign-in. Try again.");
      return;
    }

    onSuccess(
      normalizeEmail(email),
      data.otp_session_id,
      data.masked_phone,
      data.resend_available_in_seconds ?? 60,
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ProtoField label="Email" required id="email">
        <ProtoInput
          id="email"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailShowValidation(true)}
          aria-invalid={emailInlineError ? true : undefined}
          aria-describedby={emailInlineError ? "login-email-error" : undefined}
        />
        {emailInlineError ? (
          <p
            id="login-email-error"
            className="mt-1.5 text-[12px] font-semibold text-red"
            role="alert"
          >
            {emailInlineError}
          </p>
        ) : null}
      </ProtoField>
      <ProtoField
        label="Password"
        required
        id="password"
        hint={
          <>
            Minimum {PASSWORD_MIN_LENGTH} characters.{" "}
            <Link
              href={AppRoutes.forgotPassword}
              className="font-semibold text-accent-deep underline-offset-2 hover:underline"
            >
              Forgot password?
            </Link>
          </>
        }
      >
        <ProtoInput
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordShowValidation(true)}
          aria-invalid={passwordInlineError ? true : undefined}
          aria-describedby={
            passwordInlineError ? "login-password-error" : undefined
          }
        />
        {passwordInlineError ? (
          <p
            id="login-password-error"
            className="mt-1.5 text-[12px] font-semibold text-red"
            role="alert"
          >
            {passwordInlineError}
          </p>
        ) : null}
      </ProtoField>
      {error ? (
        <p className="mb-4 text-[13px] font-semibold text-red" role="alert">
          {error}
        </p>
      ) : null}
      <ProtoBtn
        type="submit"
        className="w-full"
        disabled={!canSubmit || submitting}
      >
        {submitting ? "Checking…" : "Continue"}
      </ProtoBtn>
      <p className="mt-3.5 text-center text-xs leading-relaxed text-ink-faint">
        Accounts are created by Jiwambe backoffice — no self sign-up. New agents
        use the activation link from CRM.
      </p>
    </form>
  );
}
