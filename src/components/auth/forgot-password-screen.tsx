"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import {
  ProtoBtn,
  ProtoField,
  ProtoInput,
} from "@/components/onboarding/atoms/proto-field";
import {
  emailFormatErrorMessage,
  isValidEmailFormat,
  normalizeEmail,
} from "@/lib/global/auth/normalize-email";
import { AppRoutes } from "@/lib/global/shared/routes";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailShowValidation, setEmailShowValidation] = useState(false);

  const emailInlineError = emailShowValidation
    ? emailFormatErrorMessage(email)
    : null;
  const emailValid = isValidEmailFormat(email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailShowValidation(true);
    if (!emailValid || submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const response = await fetch(AppRoutes.apiOnboardingAuthPasswordForgot, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email: normalizeEmail(email) }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
    };

    setSubmitting(false);

    if (response.status === 429) {
      setError(data.message ?? "Too many attempts. Try again later.");
      return;
    }

    if (!response.ok) {
      setError(data.message ?? "Could not send reset instructions. Try again.");
      return;
    }

    setSuccessMessage(
      data.message ??
        "If an account exists for that email, we sent reset instructions.",
    );
  }

  return (
    <AuthScreenLayout>
      <h1 className="font-display text-[22px] text-ink">Forgot password</h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
        Enter your work email. We will send a link to reset your password if an
        account exists.
      </p>

      {successMessage ? (
        <p
          className="mt-4 rounded-xl bg-accent-soft px-3 py-2.5 text-[13px] leading-relaxed text-accent-deep"
          role="status"
        >
          {successMessage}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4" noValidate>
          <ProtoField label="Email" required id="forgot-email">
            <ProtoInput
              id="forgot-email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailShowValidation(true)}
            />
            {emailInlineError ? (
              <p className="mt-1.5 text-[12px] font-semibold text-red" role="alert">
                {emailInlineError}
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
            disabled={!emailValid || submitting}
          >
            {submitting ? "Sending…" : "Send reset link"}
          </ProtoBtn>
        </form>
      )}

      <p className="mt-6 text-center text-[13px]">
        <Link
          href={AppRoutes.home}
          className="font-semibold text-accent-deep underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthScreenLayout>
  );
}
