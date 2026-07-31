"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { performOfficerSignOut } from "@/components/auth/sign-out-button";
import { bffFetch } from "@/lib/global/client/bff-fetch";
import { validateNewPassword } from "@/lib/global/auth/validate-password";
import { AppRoutes } from "@/lib/global/shared/routes";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!currentPassword.trim()) {
      setFormError("Enter your current password.");
      return;
    }

    const check = validateNewPassword(password, passwordConfirm);
    if (!check.ok) {
      setFormError(check.message);
      return;
    }

    setSubmitting(true);
    try {
      const response = await bffFetch(AppRoutes.apiOnboardingAuthPasswordChange, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirm: passwordConfirm,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        if (data.error === "invalid_credentials") {
          setFormError("Current password is incorrect.");
          return;
        }
        setFormError(
          data.message ??
            "Could not update password. Try again or contact support.",
        );
        return;
      }

      await performOfficerSignOut(`${AppRoutes.home}?passwordChanged=1`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="mb-3.5 rounded-2xl border border-line bg-card p-[18px]"
    >
      <h2 className="font-display text-lg text-ink">Change password</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
        You will be signed out after saving. Sign in again with your new
        password and SMS code.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <Label htmlFor="current-password" className="text-ink-soft">
            Current password
          </Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="new-password" className="text-ink-soft">
            New password
          </Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="confirm-password" className="text-ink-soft">
            Confirm new password
          </Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {formError ? (
        <p className="mt-3 text-[13px] font-semibold text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="mt-4 w-full" disabled={submitting}>
        {submitting ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}
