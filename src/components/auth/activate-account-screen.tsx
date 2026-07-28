"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ONBOARDING_SUPPORT_EMAIL,
  ONBOARDING_SUPPORT_PHONE,
} from "@/lib/global/auth/support-contact";
import { validateNewPassword } from "@/lib/global/auth/validate-password";
import { AppRoutes } from "@/lib/global/shared/routes";

type ActivateState =
  | { status: "loading" }
  | { status: "ready"; emailMasked: string }
  | { status: "error"; message: string };

export function ActivateAccountScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [activateState, setActivateState] = useState<ActivateState>({
    status: "loading",
  });
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validateToken = useCallback(async () => {
    if (!token) {
      setActivateState({
        status: "error",
        message:
          "This activation link is missing a token. Open the link from your CRM email.",
      });
      return;
    }

    const response = await fetch(AppRoutes.apiOnboardingAuthActivate, {
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
      setActivateState({
        status: "error",
        message:
          data.message ??
          "This activation link has expired or was already used. Ask backoffice to send a new link.",
      });
      return;
    }

    if (!data.email_masked) {
      setActivateState({
        status: "error",
        message: "Could not validate this link. Request a new one from CRM.",
      });
      return;
    }

    setActivateState({
      status: "ready",
      emailMasked: data.email_masked,
    });
  }, [token]);

  useEffect(() => {
    // Token validation is a one-shot fetch on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async validation updates UI state
    void validateToken();
  }, [validateToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activateState.status !== "ready" || submitting) return;

    const check = validateNewPassword(password, passwordConfirm);
    if (!check.ok) {
      setFormError(check.message);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const response = await fetch(AppRoutes.apiOnboardingAuthActivatePassword, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        password,
        password_confirm: passwordConfirm,
      }),
    });

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

  return (
    <AuthScreenLayout>
      {activateState.status === "loading" ? (
        <p className="text-sm text-ink-soft">Checking your activation link…</p>
      ) : null}

      {activateState.status === "error" ? (
        <div>
          <h1 className="font-display text-[22px] text-ink">Link not valid</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            {activateState.message}
          </p>
          <p className="mt-4 text-[13px] text-ink-soft">
            Support: {ONBOARDING_SUPPORT_EMAIL} · {ONBOARDING_SUPPORT_PHONE}
          </p>
        </div>
      ) : null}

      {activateState.status === "ready" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="font-display text-[22px] text-ink">Set your password</h1>
          <p className="text-[13.5px] leading-relaxed text-ink-soft">
            Account <b>{activateState.emailMasked}</b>. Choose a password you will
            use with email sign-in and SMS verification.
          </p>
          <div>
            <Label htmlFor="new-password" className="text-ink-soft">
              New password
            </Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              className="mt-2 border-line bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password" className="text-ink-soft">
              Confirm password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="mt-2 border-line bg-white"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
          {formError ? (
            <p className="text-[13px] font-semibold text-red-600" role="alert">
              {formError}
            </p>
          ) : null}
          <Button
            type="submit"
            className="h-auto w-full rounded-xl py-3.5 font-bold"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save password"}
          </Button>
        </form>
      ) : null}
    </AuthScreenLayout>
  );
}
