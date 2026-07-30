import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { CAPTURE_STAGES } from "@/lib/onboarding/capture/stages";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import {
  firstIncompleteSubmitStage,
  isCaptureStageComplete,
} from "@/lib/onboarding/capture/stage-validation";
import { captureStagePath } from "@/lib/onboarding/capture/nav";

export type ReviewChecklistItem = {
  stage: CaptureStageKey;
  label: string;
  complete: boolean;
  href: string | null;
};

export function reviewChecklistItems(
  form: CaptureFormState,
  referenceCode: string | null,
): ReviewChecklistItem[] {
  return CAPTURE_STAGES.filter((s) => s.key !== "review").map((stage) => ({
    stage: stage.key,
    label: stage.label,
    complete: isCaptureStageComplete(stage.key, form),
    href: referenceCode ? captureStagePath(stage.key, referenceCode) : null,
  }));
}

export function reviewBlockingSummary(form: CaptureFormState): string | null {
  const incomplete = firstIncompleteSubmitStage(form);
  if (!incomplete) return null;
  const meta = CAPTURE_STAGES.find((s) => s.key === incomplete);
  return meta
    ? `Complete “${meta.label}” before submitting.`
    : "Complete every capture section before submitting.";
}
