import { describe, expect, it } from "vitest";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";
import {
  buildClearPatchesForPurposes,
  getRequiredDocumentPurposesForStage,
  getStaleDocumentPurposesAfterPatch,
} from "@/lib/onboarding/capture/capture-document-requirements";

describe("capture-document-requirements", () => {
  it("requires all identity documents on identity stage", () => {
    const form = createEmptyCaptureForm();
    const required = getRequiredDocumentPurposesForStage("identity", form);
    expect(required).toEqual([
      "id_front",
      "id_back",
      "kra_certificate",
      "selfie",
    ]);
  });

  it("requires smart DL front and back", () => {
    const form = createEmptyCaptureForm();
    form.dlSituation = "smart";
    expect(getRequiredDocumentPurposesForStage("dl", form)).toEqual([
      "dl_front",
      "dl_back",
    ]);
  });

  it("requires separate PDL document for provisional licence", () => {
    const form = createEmptyCaptureForm();
    form.dlSituation = "pdl";
    expect(getRequiredDocumentPurposesForStage("dl", form)).toEqual([
      "pdl_document",
    ]);
  });

  it("requires DL front and peleza report when processing", () => {
    const form = createEmptyCaptureForm();
    form.dlSituation = "processing";
    expect(getRequiredDocumentPurposesForStage("dl", form)).toEqual([
      "dl_front",
      "dl_peleza_report",
    ]);
  });

  it("requires COGC certificate or peleza report by situation", () => {
    const have = createEmptyCaptureForm();
    have.cogcSituation = "have";
    expect(getRequiredDocumentPurposesForStage("cogc", have)).toEqual([
      "cogc_certificate",
    ]);

    const peleza = createEmptyCaptureForm();
    peleza.cogcSituation = "peleza";
    expect(getRequiredDocumentPurposesForStage("cogc", peleza)).toEqual([
      "cogc_peleza_report",
    ]);
  });

  it("requires consent document for delivery when consented", () => {
    const form = createEmptyCaptureForm();
    form.opModel = "DELIVERY";
    form.verifyConsent = true;
    expect(getRequiredDocumentPurposesForStage("model", form)).toEqual([
      "consent_document",
    ]);
  });

  it("clears stale DL documents when situation changes", () => {
    const prev = createEmptyCaptureForm();
    prev.dlFrontPhoto = "blob:front";
    prev.dlFrontDocId = "doc_front";
    const stale = getStaleDocumentPurposesAfterPatch(prev, {
      dlSituation: "pdl",
    });
    expect(stale).toContain("dl_front");
    const cleared = buildClearPatchesForPurposes(stale);
    expect(cleared.dlFrontPhoto).toBeNull();
    expect(cleared.dlFrontDocId).toBeNull();
  });
});
