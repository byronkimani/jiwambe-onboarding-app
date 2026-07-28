import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { isReadinessComplete } from "@/lib/onboarding/capture/readiness";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import { CAPTURE_STAGES } from "@/lib/onboarding/capture/stages";

function stageIndex(key: CaptureStageKey): number {
  return CAPTURE_STAGES.findIndex((s) => s.key === key);
}

export function captureStageCompleteMap(
  form: CaptureFormState,
  current: CaptureStageKey,
): Partial<Record<CaptureStageKey, boolean>> {
  const currentIdx = stageIndex(current);
  const map: Partial<Record<CaptureStageKey, boolean>> = {};

  const checks: Partial<Record<CaptureStageKey, boolean>> = {
    readiness: isReadinessComplete(form.readiness),
    lookup: Boolean(form.customerFound),
    identity: Boolean(form.name && form.phone && form.idNo),
    dl: Boolean(form.dlSituation),
    cogc: Boolean(form.cogcSituation),
    references:
      form.refConsent &&
      form.references.every((r) => r.name.trim().length > 0),
    model: Boolean(form.opModel),
    product: Boolean(form.productId && form.stkVerified),
    bike: Boolean(form.bikeReg),
    review: false,
  };

  for (const stage of CAPTURE_STAGES) {
    const idx = stageIndex(stage.key);
    if (idx < currentIdx && checks[stage.key]) {
      map[stage.key] = true;
    }
  }

  return map;
}

export function captureStageMeta(key: CaptureStageKey): {
  title: string;
  sub?: string;
} {
  const row = CAPTURE_STAGES.find((s) => s.key === key);
  const title = row?.label ?? key;
  const subs: Partial<Record<CaptureStageKey, string>> = {
    readiness:
      "Two minutes now saves forty later. Run through these with the customer before opening an application — if anything is missing, agree on a return date instead.",
    lookup: "Match an existing portal customer or start a new profile.",
    review: "Confirm details before sending the application to operations.",
  };
  return { title, sub: subs[key] };
}
