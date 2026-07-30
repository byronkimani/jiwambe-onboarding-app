import { describe, expect, it } from "vitest";
import {
  createEmptyDocumentUploadState,
  isDocumentUploadBlockingForPurposes,
  syncDocumentUploadStateFromForm,
} from "@/lib/onboarding/capture/document-upload-state";

describe("document-upload-state", () => {
  it("blocks when a required purpose is uploading", () => {
    const state = createEmptyDocumentUploadState();
    state.dl_front.status = "uploading";
    expect(
      isDocumentUploadBlockingForPurposes(state, ["dl_front", "dl_back"]),
    ).toBe(true);
  });

  it("syncs uploaded status from form doc ids", () => {
    const state = syncDocumentUploadStateFromForm({
      id_front: "doc_1",
      selfie: "doc_2",
    });
    expect(state.id_front.status).toBe("uploaded");
    expect(state.selfie.status).toBe("uploaded");
    expect(state.dl_front.status).toBe("idle");
  });
});
