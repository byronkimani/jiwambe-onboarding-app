import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { CAPTURE_STAGES } from "@/lib/onboarding/capture/stages";
import { isCaptureStageComplete } from "@/lib/onboarding/capture/stage-validation";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";

const RESUME_STAGES: CaptureStageKey[] = CAPTURE_STAGES.map((s) => s.key).filter(
  (key) => key !== "review",
);

/** First wizard stage that still fails validation (for resume redirects). */
export function firstIncompleteCaptureStage(
  form: CaptureFormState,
): CaptureStageKey {
  for (const key of RESUME_STAGES) {
    if (!isCaptureStageComplete(key, form)) {
      return key;
    }
  }
  return "review";
}
