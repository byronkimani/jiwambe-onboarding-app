import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { CAPTURE_STAGES } from "@/lib/onboarding/capture/stages";
import { hydrateCaptureFormFromResource } from "@/lib/onboarding/capture/resource-to-capture-form";
import { validateCaptureStage } from "@/lib/onboarding/capture/stage-validation";
import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";

export type SubmitBlockingIssue = {
  code: string;
  message: string;
};

const SUBMIT_STAGE_KEYS: CaptureStageKey[] = CAPTURE_STAGES.map(
  (s) => s.key,
).filter((key) => key !== "review");

/** Server-side gate for POST submit (mirrors capture stage validation). */
export function blockingIssuesForSubmit(
  resource: OnboardingApplicationResource,
): SubmitBlockingIssue[] {
  const issues: SubmitBlockingIssue[] = [];
  const form = hydrateCaptureFormFromResource(resource);

  for (const stage of SUBMIT_STAGE_KEYS) {
    const result = validateCaptureStage(stage, form);
    if (!result.ok) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        issues.push({ code: `${stage}.${field}`, message });
      }
    }
  }

  if (resource.financing?.depositPayment?.status !== "verified") {
    issues.push({
      code: "financing.deposit_payment",
      message: "Deposit must be verified via M-Pesa before submit.",
    });
  }

  if (!resource.bikeAssignment?.registration) {
    issues.push({
      code: "bikeAssignment.registration",
      message: "Assign a bike before submit.",
    });
  }

  return issues;
}
