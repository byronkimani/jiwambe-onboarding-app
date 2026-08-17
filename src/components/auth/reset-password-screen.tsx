"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import {
  ProtoBtn,
  ProtoField,
  ProtoInput,
} from "@/components/onboarding/atoms/proto-field";
import {
  ONBOARDING_SUPPORT_EMAIL,
  ONBOARDING_SUPPORT_PHONE,
} from "@/lib/global/auth/support-contact";
import {
  PASSWORD_MIN_LENGTH,
  validateNewPassword,
} from "@/lib/global/auth/validate-password";
import { AppRoutes } from "@/lib/global/shared/routes";

type ResetState =
  | { status: "loading" }
  | { status: "ready"; emailMasked: string }
  | { status: "error"; message: string };

export function ResetPasswordScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [resetState, setResetState] = useState<ResetState>({ status: "loading" });
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validateToken = useCallback(async () => {
    if (!token) {
      setResetState({
        status: "error",
        message:
          "This reset link is missing a token. Open the link from your email.",
      });
      return;
    }

    const response = await fetch(AppRoutes.apiOnboardingAuthPasswordReset, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ token }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      email_masked?: string;
      message?: string;
    };

    if (!response.ok) {
      setResetState({
        status: "error",
        message:
          data.message ??
          "This reset link has expired or was already used. Request a new link from sign in.",
      });
      return;
    }

    if (!data.email_masked) {
      setResetState({
        status: "error",
        message: "Could not validate this link. Request a new one from sign in.",
      });
      return;
    }

    setResetState({
      status: "ready",
      emailMasked: data.email_masked,
    });
  }, [token]);

  useEffect(() => {
    // Token validation is a one-shot fetch on mount; mirrors activate flow.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async validation updates UI state
    void validateToken();
  }, [validateToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (resetState.status !== "ready" || submitting) return;

    const check = validateNewPassword(password, passwordConfirm);
    if (!check.ok) {
      setFormError(check.message);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const response = await fetch(
      AppRoutes.apiOnboardingAuthPasswordResetPassword,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          password,
          password_confirm: passwordConfirm,
        }),
      },
    );

    const data = (await response.json().catch(() => ({}))) as { message?: string };

    setSubmitting(false);

    if (!response.ok) {
      setFormError(
        data.message ??
          "Could not save your password. Try again or contact support.",
      );
      return;
    }

    router.push(`${AppRoutes.home}?passwordSet=1`);
  }

  const passwordValid =
    password.length >= PASSWORD_MIN_LENGTH &&
    passwordConfirm.length >= PASSWORD_MIN_LENGTH &&
    password === passwordConfirm;

  return (
    <AuthScreenLayout>
      {resetState.status === "loading" ? (
        <p className="text-sm text-ink-soft">Checking your reset link…</p>
      ) : null}

      {resetState.status === "error" ? (
        <div>
          <h1 className="font-display text-[22px] text-ink">Link not valid</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            {resetState.message}
          </p>
          <p className="mt-4 text-[13px] text-ink-soft">
            Support: {ONBOARDING_SUPPORT_EMAIL} · {ONBOARDING_SUPPORT_PHONE}
          </p>
        </div>
      ) : null}

      {resetState.status === "ready" ? (
        <form onSubmit={handleSubmit} noValidate>
          <h1 className="font-display text-[22px] text-ink">Set a new password</h1>
          <p className="text-[13.5px] leading-relaxed text-ink-soft">
            Account <b>{resetState.emailMasked}</b>. Choose a password you will
            use with email sign-in and SMS verification.
          </p>
          <ProtoField label="New password" required id="reset-new-password" className="mt-4">
            <ProtoInput
              id="reset-new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </ProtoField>
          <ProtoField label="Confirm password" required id="reset-confirm-password">
            <ProtoInput
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </ProtoField>
          {formError ? (
            <p className="text-[13px] font-semibold text-red" role="alert">
              {formError}
            </p>
          ) : null}
          <ProtoBtn
            type="submit"
            className="w-full"
            disabled={!passwordValid || submitting}
          >
            {submitting ? "Saving…" : "Save password"}
          </ProtoBtn>
        </form>
      ) : null}
    </AuthScreenLayout>
  );
}
