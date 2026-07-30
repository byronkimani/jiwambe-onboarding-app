import { describe, expect, it } from "vitest";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";
import {
  isCaptureDirty,
  isCaptureFormDirty,
  snapshotCaptureForm,
} from "@/lib/onboarding/capture/capture-dirty-state";
import { createEmptyDocumentUploadState } from "@/lib/onboarding/capture/document-upload-state";

describe("capture-dirty-state", () => {
  it("detects form changes against empty baseline when no snapshot saved", () => {
    const form = createEmptyCaptureForm();
    form.name = "Grace";
    expect(isCaptureFormDirty(form, null)).toBe(true);
  });

  it("is clean when form matches saved snapshot", () => {
    const form = createEmptyCaptureForm();
    form.name = "Grace";
    const snapshot = snapshotCaptureForm(form);
    expect(isCaptureFormDirty(form, snapshot)).toBe(false);
  });

  it("is dirty when document upload failed with pending file", () => {
    const form = createEmptyCaptureForm();
    const uploads = createEmptyDocumentUploadState();
    uploads.id_front = {
      status: "failed",
      pendingFile: new File(["x"], "id.jpg", { type: "image/jpeg" }),
      error: "Upload failed. Try again.",
    };
    expect(
      isCaptureDirty({
        form,
        savedFormSnapshot: snapshotCaptureForm(form),
        documentUploads: uploads,
      }),
    ).toBe(true);
  });
});
