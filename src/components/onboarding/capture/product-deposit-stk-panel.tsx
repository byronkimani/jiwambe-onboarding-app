"use client";

import { useCallback } from "react";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import {
  apiDepositStk,
  apiDepositValidate,
  apiFetchApplication,
} from "@/lib/onboarding/capture/application-api";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";
import { ProtoBtn, ProtoField, ProtoInput } from "@/components/onboarding/atoms/proto-field";
import { CaptureInlineError } from "@/components/onboarding/capture/capture-inline-error";

type Props = {
  form: CaptureFormState;
  referenceCode: string | null;
  showValidation: boolean;
  fieldError?: string;
  patchForm: (patch: Partial<CaptureFormState>) => void;
  syncFromResource: (
    resource: import("@/lib/onboarding/application-resource").OnboardingApplicationResource,
  ) => void;
};

async function pollStkValidate(
  referenceCode: string,
  checkoutId: string,
  maxAttempts = 5,
): Promise<
  | { status: "verified"; mpesaReceipt?: string | null }
  | { status: "pending" | "failed" }
> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await apiDepositValidate({
      applicationReferenceCode: referenceCode,
      checkoutId,
    });
    if (!result.ok) {
      return { status: "failed" };
    }
    if (result.status === "verified") {
      return { status: "verified", mpesaReceipt: result.mpesaReceipt };
    }
    if (result.status === "failed") {
      return { status: "failed" };
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return { status: "pending" };
}

async function applyVerifiedDeposit(
  referenceCode: string,
  mpesaReceipt: string | null,
  patchForm: (patch: Partial<CaptureFormState>) => void,
  syncFromResource: Props["syncFromResource"],
): Promise<void> {
  patchForm({
    stkState: "confirmed",
    stkVerified: true,
    stkRef: mpesaReceipt,
  });
  const refreshed = await apiFetchApplication(referenceCode);
  if (refreshed.ok) {
    syncFromResource(refreshed.application);
  }
}

export function ProductDepositStkPanel({
  form,
  referenceCode,
  showValidation,
  fieldError,
  patchForm,
  syncFromResource,
}: Props) {
  const busy =
    form.stkState === "initiated" ||
    form.stkState === "waiting" ||
    form.stkState === "fallbackChecking";

  const startStk = useCallback(async () => {
    if (!referenceCode) return;
    patchForm({ stkState: "initiated", stkVerified: false });
    const phoneParsed = form.phone ? parseKenyaPhoneForSubmit(form.phone) : null;
    const stk = await apiDepositStk({
      applicationReferenceCode: referenceCode,
      depositKes: form.deposit,
      phone: phoneParsed?.ok ? phoneParsed.wire : undefined,
    });
    if (!stk.ok) {
      patchForm({ stkState: "failed" });
      return;
    }
    patchForm({
      stkState: "waiting",
      stkCheckoutId: stk.checkoutId,
    });
    const outcome = await pollStkValidate(referenceCode, stk.checkoutId);
    if (outcome.status === "verified") {
      await applyVerifiedDeposit(
        referenceCode,
        outcome.mpesaReceipt ?? null,
        patchForm,
        syncFromResource,
      );
      return;
    }
    if (outcome.status === "pending") {
      patchForm({ stkState: "waiting" });
      return;
    }
    patchForm({ stkState: "failed" });
  }, [form.deposit, form.phone, patchForm, referenceCode, syncFromResource]);

  const checkWaiting = useCallback(async () => {
    if (!referenceCode || !form.stkCheckoutId) return;
    patchForm({ stkState: "waiting" });
    const outcome = await pollStkValidate(referenceCode, form.stkCheckoutId);
    if (outcome.status === "verified") {
      await applyVerifiedDeposit(
        referenceCode,
        outcome.mpesaReceipt ?? null,
        patchForm,
        syncFromResource,
      );
      return;
    }
    if (outcome.status === "failed") {
      patchForm({ stkState: "failed" });
    }
  }, [form.stkCheckoutId, patchForm, referenceCode, syncFromResource]);

  const submitFallback = useCallback(async () => {
    if (!referenceCode || !form.fallbackCode.trim()) return;
    patchForm({ stkState: "fallbackChecking" });
    const result = await apiDepositValidate({
      applicationReferenceCode: referenceCode,
      mpesaReceipt: form.fallbackCode.trim(),
    });
    if (!result.ok || result.status !== "verified") {
      patchForm({ stkState: "fallback" });
      return;
    }
    await applyVerifiedDeposit(
      referenceCode,
      result.mpesaReceipt ?? form.fallbackCode.trim(),
      patchForm,
      syncFromResource,
    );
  }, [form.fallbackCode, patchForm, referenceCode, syncFromResource]);

  if (form.stkState === "confirmed" || form.stkVerified) {
    return (
      <p className="text-sm font-bold text-accent-deep">
        M-Pesa deposit verified
        {form.stkRef ? ` · ${form.stkRef}` : ""}
      </p>
    );
  }

  if (form.stkState === "fallback" || form.stkState === "fallbackChecking") {
    return (
      <div className="space-y-2 rounded-xl border border-line bg-card-deep p-3">
        <p className="text-sm text-ink-soft">Enter M-Pesa confirmation code</p>
        <ProtoField label="M-Pesa code">
          <ProtoInput
            aria-label="M-Pesa confirmation code"
            value={form.fallbackCode}
            onChange={(e) => patchForm({ fallbackCode: e.target.value })}
          />
        </ProtoField>
        <ProtoBtn
          disabled={busy || !form.fallbackCode.trim()}
          onClick={() => void submitFallback()}
        >
          {form.stkState === "fallbackChecking" ? "Checking…" : "Verify code"}
        </ProtoBtn>
        <ProtoBtn ghost onClick={() => patchForm({ stkState: "idle" })}>
          Back to STK
        </ProtoBtn>
      </div>
    );
  }

  if (form.stkState === "failed") {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-red-600">
          STK push failed or timed out.
        </p>
        <ProtoBtn ghost onClick={() => void startStk()}>
          Retry STK push
        </ProtoBtn>
        <ProtoBtn ghost onClick={() => patchForm({ stkState: "fallback" })}>
          Enter M-Pesa code instead
        </ProtoBtn>
        <CaptureInlineError show={showValidation} message={fieldError} />
      </div>
    );
  }

  if (form.stkState === "waiting") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-ink-soft">
          Waiting for customer to approve STK on their phone…
        </p>
        <ProtoBtn disabled={busy} onClick={() => void checkWaiting()}>
          Check payment status
        </ProtoBtn>
        <ProtoBtn ghost onClick={() => patchForm({ stkState: "fallback" })}>
          Enter M-Pesa code instead
        </ProtoBtn>
        <CaptureInlineError show={showValidation} message={fieldError} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ProtoBtn
        disabled={busy || !referenceCode}
        onClick={() => void startStk()}
      >
        {form.stkState === "initiated" ? "Sending STK push…" : "Send STK push"}
      </ProtoBtn>
      {!referenceCode ? (
        <p className="text-xs text-ink-soft">
          Save readiness first to link deposit to this application.
        </p>
      ) : null}
      <ProtoBtn ghost onClick={() => patchForm({ stkState: "fallback" })}>
        Enter M-Pesa code instead
      </ProtoBtn>
      <CaptureInlineError show={showValidation} message={fieldError} />
    </div>
  );
}
