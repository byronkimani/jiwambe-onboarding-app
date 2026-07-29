"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div>
            <Label htmlFor="forgot-email" className="text-ink-soft">
              Email
            </Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              className="mt-2 border-line bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailShowValidation(true)}
              aria-invalid={emailInlineError ? true : undefined}
              aria-describedby={
                emailInlineError ? "forgot-email-error" : undefined
              }
            />
            {emailInlineError ? (
              <p
                id="forgot-email-error"
                className="mt-1.5 text-[12px] font-semibold text-red-600"
                role="alert"
              >
                {emailInlineError}
              </p>
            ) : null}
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
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
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
