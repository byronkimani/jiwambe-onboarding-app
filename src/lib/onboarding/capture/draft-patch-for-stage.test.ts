import { describe, expect, it } from "vitest";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";
import { draftPatchBodyForStage } from "@/lib/onboarding/capture/draft-patch-for-stage";

describe("draftPatchBodyForStage identity documents", () => {
  it("omits blob-only identity photos from draft patch", () => {
    const form = createEmptyCaptureForm();
    form.name = "Grace";
    form.phone = "0712 334 556";
    form.idPhotoFront = "blob:http://localhost/id";
    form.idPhotoFrontDocId = null;

    const patch = draftPatchBodyForStage("identity", form, 1);
    expect(patch?.customer?.legalName).toBe("Grace");
    expect(patch?.customer?.idFront).toBeUndefined();
  });

  it("includes uploaded identity photos with server ids", () => {
    const form = createEmptyCaptureForm();
    form.name = "Grace";
    form.idPhotoFront = "https://cdn.test/id.jpg";
    form.idPhotoFrontDocId = "doc_id_front";

    const patch = draftPatchBodyForStage("identity", form, 1);
    expect(patch?.customer?.idFront).toEqual({
      documentId: "doc_id_front",
      url: "https://cdn.test/id.jpg",
      status: "ready",
    });
  });
});
