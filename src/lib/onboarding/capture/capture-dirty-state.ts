import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";
import type { DocumentUploadState } from "@/lib/onboarding/capture/document-upload-state";
import { hasDocumentUploadDirtyExtra } from "@/lib/onboarding/capture/document-upload-state";

export function snapshotCaptureForm(form: CaptureFormState): CaptureFormState {
  return structuredClone(form);
}

export function isCaptureFormDirty(
  current: CaptureFormState,
  saved: CaptureFormState | null,
): boolean {
  const baseline = saved ?? createEmptyCaptureForm();
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

export function isCaptureDirty(input: {
  form: CaptureFormState;
  savedFormSnapshot: CaptureFormState | null;
  documentUploads: DocumentUploadState;
}): boolean {
  if (hasDocumentUploadDirtyExtra(input.documentUploads)) {
    return true;
  }
  return isCaptureFormDirty(input.form, input.savedFormSnapshot);
}
