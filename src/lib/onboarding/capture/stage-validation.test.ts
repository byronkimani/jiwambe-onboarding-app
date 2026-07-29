import { describe, expect, it } from "vitest";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";
import {
  patchBodyForStage,
  createApplicationBodyFromForm,
} from "./form-to-resource-patch";
import { validateCaptureStage, isFormReadyForSubmit } from "./stage-validation";
import { READINESS_ITEMS } from "@/lib/onboarding/capture/stages";

describe("stage-validation", () => {
  it("blocks identity without photos", () => {
    const form = createEmptyCaptureForm();
    form.name = "Test";
    form.phone = "0712 334 556";
    form.idNo = "28459912";
    form.county = "Nairobi";
    const result = validateCaptureStage("identity", form);
    expect(result.ok).toBe(false);
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
    form.idPhotoFront = "blob:id";
    form.selfiePhoto = "blob:selfie";
    const patch = patchBodyForStage("identity", form, 1);
    expect(patch?.customer?.phone).toBe("254712334556");
    expect(patch?.customer?.nationalId).toBe("28459912");
  });
});
