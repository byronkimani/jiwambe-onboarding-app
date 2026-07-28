"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEMO_OTP_CODE,
  DEMO_OTP_PHONE_MASK,
} from "@/lib/global/auth/demo-credentials";
import { signInWithOtpAction } from "@/lib/global/auth/sign-in-officer-action";
import { AppRoutes } from "@/lib/global/shared/routes";
import { sanitizeCallbackUrl } from "@/lib/global/shared/sanitize-callback-url";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { ProtoBtn, ProtoField } from "@/components/onboarding/atoms/proto-field";
import { cn } from "@/lib/utils";

type Props = {
  email: string;
  password: string;
  code: string;
  onCodeChange: (value: string) => void;
  onBack: () => void;
  sessionExpired?: boolean;
};

export function OfficerOtpStep({
  email,
  password,
  code,
  onCodeChange,
  onBack,
  sessionExpired,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ok = code === DEMO_OTP_CODE;

  function handleVerify() {
    if (!ok || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await signInWithOtpAction(email, password, code);
      if (!result.ok) {
        setError("Could not sign in. Check your code and try again.");
        return;
      }
      const callback = sanitizeCallbackUrl(
        searchParams.get("callbackUrl"),
        AppRoutes.desk,
      );
      router.push(callback);
      router.refresh();
    });
  }

  return (
    <AuthScreenLayout>
      <button
        type="button"
        className="mb-3.5 cursor-pointer border-none bg-transparent p-0 text-[13.5px] font-bold text-accent-deep"
        onClick={onBack}
        disabled={pending}
      >
        ← Back
      </button>

      <h1 className="font-display text-[22px] font-normal text-ink">
        One more step
      </h1>
      <p className="mb-5 mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
        We sent a 6-digit code by SMS to the registered phone for this account —{" "}
        <b>{DEMO_OTP_PHONE_MASK}</b>.
      </p>

      {sessionExpired ? (
        <p className="mb-3 text-sm font-semibold text-amber" role="alert">
          Session expired. Sign in again.
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 text-sm font-semibold text-red" role="alert">
          {error}
        </p>
      ) : null}

      <ProtoField label="Verification code" hint={`Demo: ${DEMO_OTP_CODE}`}>
        <input
          inputMode="numeric"
          maxLength={6}
          placeholder="······"
          value={code}
          onChange={(e) =>
            onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          disabled={pending}
          className={cn(
            "jw-tap w-full rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3 text-center font-mono text-[22px] font-bold tracking-[9px] text-ink outline-none focus:border-accent focus:ring-[3px] focus:ring-accent-soft",
          )}
        />
      </ProtoField>

      <ProtoBtn
        className="w-full"
        disabled={!ok || pending}
        onClick={handleVerify}
      >
        {pending ? "Signing in…" : "Verify & sign in"}
      </ProtoBtn>
    </AuthScreenLayout>
  );
}
