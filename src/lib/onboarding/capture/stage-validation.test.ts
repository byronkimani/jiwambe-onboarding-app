import { describe, expect, it } from "vitest";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";
import {
  patchBodyForStage,
  createApplicationBodyFromForm,
} from "./form-to-resource-patch";
import { validateCaptureStage, isFormReadyForSubmit } from "./stage-validation";
import { READINESS_ITEMS } from "@/lib/onboarding/capture/stages";

describe("stage-validation", () => {
  it("blocks identity without uploaded document ids", () => {
    const form = createEmptyCaptureForm();
    form.name = "Test";
    form.phone = "0712 334 556";
    form.idNo = "28459912";
    form.kraPin = "A012345678X";
    form.gender = "male";
    form.dateOfBirth = "1990-01-01";
    form.email = "test@example.com";
    form.county = "Nairobi";
    form.subCounty = "Westlands";
    form.area = "Parklands";
    form.landmark = "Sarit Centre";
    form.idPhotoFront = "blob:preview";
    form.idPhotoBack = "blob:back";
    form.kraCertificatePhoto = "blob:kra";
    form.selfiePhoto = "blob:selfie";
    const result = validateCaptureStage("identity", form);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.idPhotoFront).toBeTruthy();
      expect(result.fieldErrors.idPhotoBack).toBeTruthy();
      expect(result.fieldErrors.kraCertificatePhoto).toBeTruthy();
      expect(result.fieldErrors.selfiePhoto).toBeTruthy();
    }
  });

  it("passes identity when document ids are present", () => {
    const form = createEmptyCaptureForm();
    form.name = "Test";
    form.phone = "0712 334 556";
    form.idNo = "28459912";
    form.kraPin = "A012345678X";
    form.gender = "male";
    form.dateOfBirth = "1990-01-01";
    form.email = "test@example.com";
    form.county = "Nairobi";
    form.subCounty = "Westlands";
    form.area = "Parklands";
    form.landmark = "Sarit Centre";
    form.idPhotoFront = "https://cdn.test/id.jpg";
    form.idPhotoFrontDocId = "doc_id";
    form.idPhotoBack = "https://cdn.test/id-back.jpg";
    form.idPhotoBackDocId = "doc_back";
    form.kraCertificatePhoto = "https://cdn.test/kra.pdf";
    form.kraCertificateDocId = "doc_kra";
    form.selfiePhoto = "https://cdn.test/selfie.jpg";
    form.selfiePhotoDocId = "doc_selfie";
    expect(validateCaptureStage("identity", form).ok).toBe(true);
  });

  it("passes readiness when all checked", () => {
    const form = createEmptyCaptureForm();
    for (const item of READINESS_ITEMS) {
      form.readiness[item.k] = true;
    }
    expect(validateCaptureStage("readiness", form).ok).toBe(true);
  });

  it("blocks review until all prior stages complete", () => {
    const form = createEmptyCaptureForm();
    expect(isFormReadyForSubmit(form)).toBe(false);
    const review = validateCaptureStage("review", form);
    expect(review.ok).toBe(false);
  });

  it("allows cogc fingerprints without uploads", () => {
    const form = createEmptyCaptureForm();
    form.cogcSituation = "fingerprints";
    expect(validateCaptureStage("cogc", form).ok).toBe(true);
  });

  it("blocks dl none until pause exit", () => {
    const form = createEmptyCaptureForm();
    form.dlSituation = "none";
    const result = validateCaptureStage("dl", form);
    expect(result.ok).toBe(false);
  });

  it("requires fleet bolt active yes", () => {
    const form = createEmptyCaptureForm();
    form.opModel = "FLEET";
    form.boltActive = "no";
    const result = validateCaptureStage("model", form);
    expect(result.ok).toBe(false);
  });

  it("requires personal residence consent when not employed", () => {
    const form = createEmptyCaptureForm();
    form.opModel = "PERSONAL";
    form.isEmployed = "no";
    form.verifyConsent = false;
    const result = validateCaptureStage("model", form);
    expect(result.ok).toBe(false);
    form.verifyConsent = true;
    expect(validateCaptureStage("model", form).ok).toBe(true);
  });
});

describe("form-to-resource-patch", () => {
  it("builds create body from readiness", () => {
    const form = createEmptyCaptureForm();
    for (const item of READINESS_ITEMS) {
      form.readiness[item.k] = true;
    }
    const body = createApplicationBodyFromForm(form);
    expect(body.readinessAttestations.hasId).toBe(true);
  });

  it("maps identity patch with wire phone", () => {
    const form = createEmptyCaptureForm();
    form.name = "Grace";
    form.phone = "0712 334 556";
    form.idNo = "2845 9912";
    form.county = "Nairobi";
    form.idPhotoFront = "https://cdn.test/id.jpg";
    form.idPhotoFrontDocId = "doc_id_front";
    form.selfiePhoto = "https://cdn.test/selfie.jpg";
    form.selfiePhotoDocId = "doc_selfie";
    const patch = patchBodyForStage("identity", form, 1);
    expect(patch?.customer?.phone).toBe("254712334556");
    expect(patch?.customer?.nationalId).toBe("28459912");
    expect(patch?.customer?.idFront?.documentId).toBe("doc_id_front");
  });

  it("omits blob identity photos from full patch", () => {
    const form = createEmptyCaptureForm();
    form.name = "Grace";
    form.phone = "0712 334 556";
    form.idNo = "2845 9912";
    form.county = "Nairobi";
    form.idPhotoFront = "blob:id";
    form.selfiePhoto = "blob:selfie";
    const patch = patchBodyForStage("identity", form, 1);
    expect(patch?.customer?.idFront).toBeNull();
    expect(patch?.customer?.selfie).toBeNull();
  });
});
