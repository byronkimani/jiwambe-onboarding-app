import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import {
  apiFetchApplication,
  apiPatchApplication,
} from "@/lib/onboarding/capture/application-api";
import { hydrateCaptureFormFromResource } from "@/lib/onboarding/capture/resource-to-capture-form";

export type PatchRecoveryResult =
  | {
      ok: true;
      skipped?: false;
      application: OnboardingApplicationResource;
      recoveredFromConflict: boolean;
      form?: CaptureFormState;
    }
  | { ok: true; skipped: true }
  | { ok: false; status: number; message: string };

export async function patchApplicationWithVersionRecovery(input: {
  referenceCode: string;
  version: number;
  form: CaptureFormState;
  buildPatch: (
    version: number,
    form: CaptureFormState,
  ) => Record<string, unknown> | null;
}): Promise<PatchRecoveryResult> {
  const attemptPatch = async (
    patchVersion: number,
    patchForm: CaptureFormState,
    isRetry: boolean,
  ): Promise<PatchRecoveryResult> => {
    const body = input.buildPatch(patchVersion, patchForm);
    if (!body) {
      return { ok: true, skipped: true };
    }

    const result = await apiPatchApplication(input.referenceCode, body);
    if (result.ok) {
      return {
        ok: true,
        application: result.application,
        recoveredFromConflict: isRetry,
        form: isRetry ? patchForm : undefined,
      };
    }

    if (result.status !== 409 || isRetry) {
      return { ok: false, status: result.status, message: result.message };
    }

    const refetch = await apiFetchApplication(input.referenceCode);
    if (!refetch.ok) {
      return { ok: false, status: refetch.status, message: refetch.message };
    }

    const hydrated = hydrateCaptureFormFromResource(refetch.application);
    return attemptPatch(refetch.application.version, hydrated, true);
  };

  return attemptPatch(input.version, input.form, false);
}
