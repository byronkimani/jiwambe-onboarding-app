"use client";

import * as Sentry from "@sentry/nextjs";
import type { ReactNode } from "react";
import { AppRoutes } from "@/lib/global/shared/routes";

export async function performOfficerSignOut(
  callbackUrl: string = AppRoutes.home,
): Promise<void> {
  await fetch(AppRoutes.apiOnboardingLogout, {
    method: "POST",
    credentials: "same-origin",
  });

  const csrfResponse = await fetch(`${AppRoutes.apiAuth}/csrf`, {
    credentials: "same-origin",
  });
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };

  await fetch(`${AppRoutes.apiAuth}/signout`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "same-origin",
    redirect: "manual",
    body: new URLSearchParams({
      csrfToken,
      callbackUrl,
    }),
  });

  Sentry.setUser(null);
  window.location.assign(callbackUrl);
}

export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={
        className ??
        "text-xs font-bold text-ink-soft hover:text-accent-deep"
      }
      onClick={() => void performOfficerSignOut()}
    >
      {children ?? "Sign out"}
    </button>
  );
}
