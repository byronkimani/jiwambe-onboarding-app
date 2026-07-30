"use client";

import { useRouter } from "next/navigation";
import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { AppRoutes } from "@/lib/global/shared/routes";
import { ExitCard } from "@/components/onboarding/capture/exit-card";
import { CaptureInlineError } from "@/components/onboarding/capture/capture-inline-error";
import { useCaptureWizard } from "@/components/onboarding/capture/capture-wizard-context";
import {
  ProtoBtn,
  ProtoField,
} from "@/components/onboarding/atoms/proto-field";
import { ValidatedTextInput } from "@/components/onboarding/atoms/validated-text-input";
import { KenyaPhoneInput } from "@/components/onboarding/atoms/kenya-phone-input";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import type { DocumentPurpose } from "@/lib/onboarding/documents/document-purposes";
import { toast } from "sonner";
import type { ReactNode } from "react";

type ModelStageBodyProps = {
  stage: CaptureStageKey;
  form: CaptureFormState;
  showValidation: boolean;
  fieldErrors: Record<string, string>;
  docSlot: (
    purpose: DocumentPurpose,
    label: string,
    options?: { required?: boolean; preferCamera?: boolean },
  ) => ReactNode;
};

export function ModelStageBody({
  stage,
  form,
  showValidation,
  fieldErrors,
  docSlot,
}: ModelStageBodyProps) {
  const router = useRouter();
  const { patchForm, pauseApplication, disqualifyApplication, patching } =
    useCaptureWizard();

  async function pauseWithReason(reason: string) {
    const ok = await pauseApplication(stage, reason);
    if (!ok) {
      toast.error("Could not pause application.");
      return;
    }
    toast.success("Application paused — saved to drafts.");
    router.push(AppRoutes.deskDrafts);
  }

  async function disqualifyWithReason(reason: string) {
    const ok = await disqualifyApplication(reason);
    if (!ok) {
      toast.error("Could not disqualify application.");
      return;
    }
    toast.success("Application disqualified.");
    router.push(AppRoutes.desk);
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-2 md:grid-cols-2">
        {["FLEET", "STAGE", "DELIVERY", "PERSONAL"].map((model) => (
          <ProtoBtn
            key={model}
            ghost={form.opModel !== model}
            className={form.opModel === model ? "bg-accent text-white" : ""}
            onClick={() => patchForm({ opModel: model })}
          >
            {model}
          </ProtoBtn>
        ))}
      </div>
      <CaptureInlineError show={showValidation} message={fieldErrors.opModel} />

      {form.opModel === "FLEET" ? (
        <div className="space-y-4 rounded-2xl border border-line p-4">
          <p className="text-sm font-bold text-ink">Bolt driver status</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "yes", label: "Active Bolt driver" },
              { value: "no", label: "Not active on Bolt" },
            ].map((opt) => (
              <ProtoBtn
                key={opt.value}
                ghost={form.boltActive !== opt.value}
                className={
                  form.boltActive === opt.value ? "bg-accent text-white" : ""
                }
                onClick={() => patchForm({ boltActive: opt.value })}
              >
                {opt.label}
              </ProtoBtn>
            ))}
          </div>
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.boltActive}
          />
          {form.boltActive === "no" ? (
            <ExitCard
              title="Cannot continue — not a Bolt driver"
              body="Fleet model requires an active Bolt driver account. Save this application as paused and revisit when the customer activates Bolt."
              actionLabel="Save draft & pause"
              loading={patching}
              onAction={() =>
                void pauseWithReason(
                  "Fleet model blocked — customer is not an active Bolt driver.",
                )
              }
            />
          ) : null}
        </div>
      ) : null}

      {form.opModel === "STAGE" ? (
        <div className="space-y-4 rounded-2xl border border-line p-4">
          <ProtoField label="Stage name" required>
            <ValidatedTextInput
              value={form.stageName}
              showValidation={showValidation}
              validate={(v) => (v.trim() ? null : "Stage name is required.")}
              onChange={(stageName) => patchForm({ stageName })}
            />
          </ProtoField>
          <ProtoField label="Chairperson name" required>
            <ValidatedTextInput
              value={form.chairName}
              showValidation={showValidation}
              validate={(v) =>
                v.trim() ? null : "Chairperson name is required."
              }
              onChange={(chairName) => patchForm({ chairName })}
            />
          </ProtoField>
          <ProtoField label="Chairperson phone" required>
            <KenyaPhoneInput
              value={form.chairPhone}
              showValidation={showValidation}
              onChange={(chairPhone) => patchForm({ chairPhone })}
            />
          </ProtoField>
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.chairPhone}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.chairCalled}
              onChange={(e) => patchForm({ chairCalled: e.target.checked })}
            />
            I called the chairperson during this session
          </label>
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.chairCalled}
          />
          <ProtoField label="Call outcome" required>
            <select
              className="jw-focus w-full rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3"
              value={form.chairOutcome}
              onChange={(e) => patchForm({ chairOutcome: e.target.value })}
            >
              <option value="">Select…</option>
              <option value="confirmed">Confirmed — customer is a member</option>
              <option value="unreachable">Unreachable</option>
              <option value="denied">Denied membership</option>
            </select>
          </ProtoField>
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.chairOutcome}
          />
          {form.chairOutcome === "unreachable" ? (
            <ExitCard
              title="Chairperson unreachable"
              body="You cannot continue without chairperson confirmation. Save as paused and retry the call later."
              actionLabel="Save draft & pause"
              loading={patching}
              onAction={() =>
                void pauseWithReason(
                  "Stage model blocked — chairperson unreachable.",
                )
              }
            />
          ) : null}
          {form.chairOutcome === "denied" ? (
            <ExitCard
              title="Chairperson denied membership"
              body="The customer cannot proceed on the stage model when membership is denied."
              actionLabel="Disqualify application"
              tone="danger"
              loading={patching}
              onAction={() =>
                void disqualifyWithReason(
                  "Stage model blocked — chairperson denied membership.",
                )
              }
            />
          ) : null}
        </div>
      ) : null}

      {form.opModel === "DELIVERY" ? (
        <div className="space-y-4 rounded-2xl border border-line p-4">
          <p className="text-sm font-bold text-ink">Delivery platform</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "yes", label: "Yes — works on a platform" },
              { value: "no", label: "No platform yet" },
            ].map((opt) => (
              <ProtoBtn
                key={opt.value}
                ghost={form.worksPlatform !== opt.value}
                className={
                  form.worksPlatform === opt.value ? "bg-accent text-white" : ""
                }
                onClick={() => patchForm({ worksPlatform: opt.value })}
              >
                {opt.label}
              </ProtoBtn>
            ))}
          </div>
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.worksPlatform}
          />
          {form.worksPlatform === "no" ? (
            <ExitCard
              title="No delivery platform"
              body="Delivery model requires an active platform or employer. Save as paused until the customer joins a platform."
              actionLabel="Save draft & pause"
              loading={patching}
              onAction={() =>
                void pauseWithReason(
                  "Delivery model blocked — customer does not work on a platform.",
                )
              }
            />
          ) : null}
          {form.worksPlatform === "yes" ? (
            <>
              <ProtoField label="Platform or employer name" required>
                <ValidatedTextInput
                  value={form.platformName}
                  showValidation={showValidation}
                  validate={(v) =>
                    v.trim() ? null : "Platform or employer name is required."
                  }
                  onChange={(platformName) => patchForm({ platformName })}
                />
              </ProtoField>
              <ProtoField label="Contact" required>
                <ValidatedTextInput
                  value={form.platformContact}
                  showValidation={showValidation}
                  validate={(v) => (v.trim() ? null : "Contact is required.")}
                  onChange={(platformContact) =>
                    patchForm({ platformContact })
                  }
                />
              </ProtoField>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.verifyConsent}
                  onChange={(e) =>
                    patchForm({ verifyConsent: e.target.checked })
                  }
                />
                Customer consents to workplace and residence verification.
              </label>
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.verifyConsent}
              />
              {form.verifyConsent
                ? docSlot(
                    "consent_document",
                    "Signed & rubber-stamped consent document",
                    { required: true },
                  )
                : null}
            </>
          ) : null}
          {docSlot(
            "business_registration",
            "Business registration certificate or permit",
          )}
        </div>
      ) : null}

      {form.opModel === "PERSONAL" ? (
        <div className="space-y-4 rounded-2xl border border-line p-4">
          <p className="text-sm font-bold text-ink">Work or business</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "yes", label: "Employed / runs a business" },
              { value: "no", label: "Neither" },
            ].map((opt) => (
              <ProtoBtn
                key={opt.value}
                ghost={form.isEmployed !== opt.value}
                className={
                  form.isEmployed === opt.value ? "bg-accent text-white" : ""
                }
                onClick={() => patchForm({ isEmployed: opt.value })}
              >
                {opt.label}
              </ProtoBtn>
            ))}
          </div>
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.isEmployed}
          />
          {form.isEmployed === "yes" ? (
            <>
              <ProtoField label="Employer or business name" required>
                <ValidatedTextInput
                  value={form.employerName}
                  showValidation={showValidation}
                  validate={(v) =>
                    v.trim() ? null : "Employer or business name is required."
                  }
                  onChange={(employerName) => patchForm({ employerName })}
                />
              </ProtoField>
              <ProtoField label="Contact" required>
                <ValidatedTextInput
                  value={form.employerContact}
                  showValidation={showValidation}
                  validate={(v) => (v.trim() ? null : "Contact is required.")}
                  onChange={(employerContact) =>
                    patchForm({ employerContact })
                  }
                />
              </ProtoField>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.verifyConsent}
                  onChange={(e) =>
                    patchForm({ verifyConsent: e.target.checked })
                  }
                />
                Customer consents to workplace and residence verification.
              </label>
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.verifyConsent}
              />
              {form.verifyConsent
                ? docSlot(
                    "consent_document",
                    "Signed & rubber-stamped consent document",
                    { required: true },
                  )
                : null}
              {docSlot(
                "business_registration",
                "Business registration certificate or permit",
              )}
            </>
          ) : null}
          {form.isEmployed === "no" ? (
            <>
              <p className="text-sm text-ink-soft">
                Customer is not employed — residence verification consent is
                still required.
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.verifyConsent}
                  onChange={(e) =>
                    patchForm({ verifyConsent: e.target.checked })
                  }
                />
                Customer consents to residence verification.
              </label>
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.verifyConsent}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
