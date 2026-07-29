"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { AppRoutes } from "@/lib/global/shared/routes";
import {
  captureStagePath,
  nextCaptureStage,
  prevCaptureStage,
} from "@/lib/onboarding/capture/nav";
import { useCaptureWizard } from "@/components/onboarding/capture/capture-wizard-context";
import { CaptureApplicationResume } from "@/components/onboarding/capture/capture-application-resume";
import { CaptureChromeLayout } from "@/components/onboarding/capture/capture-chrome-layout";
import { StageShell } from "@/components/onboarding/capture/stage-shell";
import { CaptureStageBody } from "@/components/onboarding/capture/stages/capture-stage-body";
import { ReasonModal } from "@/components/onboarding/chrome/reason-modal";
import {
  captureStageCompleteMap,
  captureStageMeta,
} from "@/lib/onboarding/capture/capture-progress";
import { validateCaptureStage, isCaptureStageComplete, isFormReadyForSubmit } from "@/lib/onboarding/capture/stage-validation";
import { toast } from "sonner";

type Props = { stage: CaptureStageKey };

const PAUSE_STAGES: CaptureStageKey[] = [
  "lookup",
  "identity",
  "dl",
  "cogc",
  "references",
  "model",
  "product",
  "bike",
];

export function CaptureStageScreen({ stage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationQuery = searchParams.get("application");
  const {
    form,
    referenceCode,
    patching,
    apiError,
    createApplicationFromReadiness,
    patchApplicationForStage,
    pauseApplication,
    submitApplication,
    disqualifyApplication,
  } = useCaptureWizard();
  const [showValidation, setShowValidation] = useState(false);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [disqualifyModalOpen, setDisqualifyModalOpen] = useState(false);

  const validation = validateCaptureStage(stage, form);
  const canContinue = validation.ok && !patching;
  const canPause =
    PAUSE_STAGES.includes(stage) && Boolean(referenceCode) && !patching;

  const readyToSubmit =
    Boolean(referenceCode) && !patching && isFormReadyForSubmit(form);
  const reviewValidation = validateCaptureStage("review", form);

  function captureRefForNav(): string | undefined {
    return referenceCode ?? applicationQuery ?? undefined;
  }

  async function goNext() {
    setShowValidation(true);
    const result = validateCaptureStage(stage, form);
    if (!result.ok) {
      const first = Object.values(result.fieldErrors)[0];
      toast.error(first ?? "Complete required fields.");
      return;
    }

    if (stage === "readiness") {
      const created = await createApplicationFromReadiness();
      if (!created.ok) {
        toast.error(apiError ?? "Could not create application.");
        return;
      }
      const next = nextCaptureStage(stage);
      if (!next) return;
      router.push(captureStagePath(next, created.referenceCode));
      return;
    } else if (stage !== "review") {
      const saved = await patchApplicationForStage(stage);
      if (!saved.ok) {
        toast.error(apiError ?? "Could not save progress.");
        return;
      }
      if (saved.recovered) {
        toast.message("Application was updated — your screen was refreshed.");
      }
    }

    const next = nextCaptureStage(stage);
    if (!next) return;
    router.push(captureStagePath(next, captureRefForNav()));
  }

  async function confirmPause(reason: string) {
    setPauseModalOpen(false);
    const ok = await pauseApplication(stage, reason);
    if (!ok) {
      toast.error(apiError ?? "Could not pause application.");
      return;
    }
    toast.success("Application paused — saved to drafts.");
    router.push(AppRoutes.deskDrafts);
  }

  async function confirmDisqualify(reason: string) {
    setDisqualifyModalOpen(false);
    const ok = await disqualifyApplication(reason);
    if (!ok) {
      toast.error(apiError ?? "Could not disqualify application.");
      return;
    }
    toast.success("Application disqualified.");
    router.push(AppRoutes.desk);
  }

  async function confirmSubmit() {
    setShowValidation(true);
    if (!isFormReadyForSubmit(form)) {
      toast.error("Complete every required field before submitting.");
      return;
    }
    const result = await submitApplication();
    if (!result.ok) {
      const first = result.blockingIssues?.[0]?.message;
      toast.error(first ?? apiError ?? "Could not submit application.");
      return;
    }
    toast.success("Submitted to operations.");
    router.push(AppRoutes.desk);
  }

  function goBack() {
    const prev = prevCaptureStage(stage);
    if (prev) {
      router.push(captureStagePath(prev, captureRefForNav()));
      return;
    }
    router.push(AppRoutes.desk);
  }

  const meta = captureStageMeta(stage);
  const title = stage === "readiness" ? "Is the customer ready?" : meta.title;
  const sub = meta.sub;
  const completeMap = captureStageCompleteMap(form, stage);

  return (
    <>
      <CaptureApplicationResume stage={stage} />
      <CaptureChromeLayout
        stage={stage}
        completeMap={completeMap}
        customerName={form.name || undefined}
        onBack={goBack}
      >
        <StageShell
          title={title}
          sub={sub}
          onBack={goBack}
          onNext={
            stage === "review"
              ? () => void confirmSubmit()
              : () => void goNext()
          }
          nextLabel={
            stage === "readiness"
              ? "Customer is ready — start"
              : stage === "review"
                ? patching
                  ? "Submitting…"
                  : "Submit to backoffice"
                : patching
                  ? "Saving…"
                  : "Continue"
          }
          nextDisabled={stage === "review" ? !readyToSubmit : !canContinue}
          onPause={
            canPause ? () => setPauseModalOpen(true) : undefined
          }
          pauseDisabled={patching}
          onDisqualify={
            referenceCode ? () => setDisqualifyModalOpen(true) : undefined
          }
        >
          <CaptureStageBody
            stage={stage}
            form={form}
            showValidation={showValidation}
          />
          {apiError ? (
            <p
              className="mt-3 text-[13px] font-semibold text-red-600"
              role="alert"
            >
              {apiError}
            </p>
          ) : null}
          {stage === "review" && showValidation && !reviewValidation.ok ? (
            <p className="mt-3 text-[13px] font-semibold text-red-600" role="alert">
              {reviewValidation.fieldErrors.review}
            </p>
          ) : null}
        </StageShell>
      </CaptureChromeLayout>
      <ReasonModal
        open={pauseModalOpen}
        title="Pause application"
        hint="The application will be saved as paused and moved to your drafts. Any bike picked here is not yet reserved, so nothing is lost."
        confirmLabel="Pause"
        onConfirm={(reason) => void confirmPause(reason)}
        onCancel={() => setPauseModalOpen(false)}
      />
      <ReasonModal
        open={disqualifyModalOpen}
        title="Disqualify application"
        hint="This closes the application. Use when the customer cannot proceed or policy blocks onboarding."
        confirmLabel="Disqualify"
        onConfirm={(reason) => void confirmDisqualify(reason)}
        onCancel={() => setDisqualifyModalOpen(false)}
      />
    </>
  );
}
