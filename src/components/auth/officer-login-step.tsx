"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppRoutes } from "@/lib/global/shared/routes";
import {
  emailFormatErrorMessage,
  isValidEmailFormat,
  normalizeEmail,
} from "@/lib/global/auth/normalize-email";
import { PASSWORD_MIN_LENGTH } from "@/lib/global/auth/validate-password";

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

  const emailInlineError = emailShowValidation
    ? emailFormatErrorMessage(email)
    : null;
  const emailValid = isValidEmailFormat(email);
  const passwordValid = password.length >= PASSWORD_MIN_LENGTH;
  const canSubmit = emailValid && passwordValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailShowValidation(true);
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email" className="text-ink-soft">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          className="mt-2 border-line bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailShowValidation(true)}
          aria-invalid={emailInlineError ? true : undefined}
          aria-describedby={emailInlineError ? "login-email-error" : undefined}
        />
        {emailInlineError ? (
          <p
            id="login-email-error"
            className="mt-1.5 text-[12px] font-semibold text-red-600"
            role="alert"
          >
            {emailInlineError}
          </p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="password" className="text-ink-soft">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="mt-2 border-line bg-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="mt-1.5 text-[12px] text-ink-soft">
          Minimum {PASSWORD_MIN_LENGTH} characters.{" "}
          <Link
            href={AppRoutes.forgotPassword}
            className="font-semibold text-accent-deep underline-offset-2 hover:underline"
          >
            Forgot password?
          </Link>
        </p>
      </div>
      {error ? (
        <p className="text-[13px] font-semibold text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-auto w-full rounded-xl py-3.5 font-bold"
        disabled={submitting}
      >
        {submitting ? "Checking…" : "Continue"}
      </Button>
      <p className="text-center text-[12px] leading-relaxed text-ink-soft">
        Accounts are created by Jiwambe backoffice — no self sign-up. New agents
        use the activation link from CRM.
      </p>
    </form>
  );
}
