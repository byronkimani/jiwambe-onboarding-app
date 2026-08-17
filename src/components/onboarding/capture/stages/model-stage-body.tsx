"use client";

import { useRouter } from "next/navigation";
import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { AppRoutes } from "@/lib/global/shared/routes";
import { ExitCard } from "@/components/onboarding/capture/exit-card";
import { CaptureInlineError } from "@/components/onboarding/capture/capture-inline-error";
import { useCaptureWizard } from "@/components/onboarding/capture/capture-wizard-context";
import {
  ProtoField,
  ProtoSelect,
} from "@/components/onboarding/atoms/proto-field";
import { ProtoChoiceRow } from "@/components/onboarding/atoms/proto-choice-row";
import { ProtoCheckbox } from "@/components/onboarding/atoms/proto-checkbox";
import { SectionCard } from "@/components/onboarding/atoms/section-card";
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
    <div className="mt-4">
      <SectionCard title="Operating model">
        <ProtoChoiceRow
          value={form.opModel}
          onChange={(opModel) => patchForm({ opModel })}
          options={[
            { value: "FLEET", label: "FLEET" },
            { value: "STAGE", label: "STAGE" },
            { value: "DELIVERY", label: "DELIVERY" },
            { value: "PERSONAL", label: "PERSONAL" },
          ]}
        />
        <CaptureInlineError show={showValidation} message={fieldErrors.opModel} />
      </SectionCard>

      {form.opModel === "FLEET" ? (
        <SectionCard title="Fleet · Bolt driver status">
          <ProtoChoiceRow
            value={form.boltActive}
            onChange={(boltActive) => patchForm({ boltActive })}
            options={[
              { value: "yes", label: "Active Bolt driver" },
              { value: "no", label: "Not active on Bolt" },
            ]}
          />
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
        </SectionCard>
      ) : null}

      {form.opModel === "STAGE" ? (
        <SectionCard title="Offline · Stage">
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
          <ProtoCheckbox
            checked={form.chairCalled}
            onChange={(chairCalled) => patchForm({ chairCalled })}
            label="I called the chairperson during this session"
          />
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.chairCalled}
          />
          <ProtoField label="Call outcome" required>
            <ProtoSelect
              value={form.chairOutcome}
              onChange={(chairOutcome) => patchForm({ chairOutcome })}
              options={[
                {
                  value: "confirmed",
                  label: "Confirmed — customer is a member",
                },
                { value: "unreachable", label: "Unreachable" },
                { value: "denied", label: "Denied membership" },
              ]}
            />
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
        </SectionCard>
      ) : null}

      {form.opModel === "DELIVERY" ? (
        <SectionCard title="Delivery platform">
          <ProtoChoiceRow
            value={form.worksPlatform}
            onChange={(worksPlatform) => patchForm({ worksPlatform })}
            options={[
              { value: "yes", label: "Yes — works on a platform" },
              { value: "no", label: "No platform yet" },
            ]}
          />
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
              <ProtoCheckbox
                checked={form.verifyConsent}
                onChange={(verifyConsent) => patchForm({ verifyConsent })}
                label="Customer consents to workplace and residence verification."
              />
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
        </SectionCard>
      ) : null}

      {form.opModel === "PERSONAL" ? (
        <SectionCard title="Personal use · work or business">
          <ProtoChoiceRow
            value={form.isEmployed}
            onChange={(isEmployed) => patchForm({ isEmployed })}
            options={[
              { value: "yes", label: "Employed / runs a business" },
              { value: "no", label: "Neither" },
            ]}
          />
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
              <ProtoCheckbox
                checked={form.verifyConsent}
                onChange={(verifyConsent) => patchForm({ verifyConsent })}
                label="Customer consents to workplace and residence verification."
              />
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
              <ProtoCheckbox
                checked={form.verifyConsent}
                onChange={(verifyConsent) => patchForm({ verifyConsent })}
                label="Customer consents to residence verification."
              />
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.verifyConsent}
              />
            </>
          ) : null}
        </SectionCard>
      ) : null}
    </div>
  );
}
