import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { CAPTURE_STAGES } from "@/lib/onboarding/capture/stages";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";
import { MIN_DEPOSIT_KES } from "@/lib/onboarding/fixtures/capture-fixtures";
import { isReadinessComplete } from "@/lib/onboarding/capture/readiness";
import {
  nationalIdFormatErrorMessage,
} from "@/lib/onboarding/validation/national-id";
import { KENYA_PHONE_VALIDATION_MESSAGE } from "@/lib/global/auth/phone-field-constants";

export type StageValidationResult =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string> };

function phoneError(phone: string): string | null {
  if (!phone.trim()) return "Phone is required.";
  if (!parseKenyaPhoneForSubmit(phone).ok) {
    return KENYA_PHONE_VALIDATION_MESSAGE;
  }
  return null;
}

export function validateCaptureStage(
  stage: CaptureStageKey,
  form: CaptureFormState,
): StageValidationResult {
  const fieldErrors: Record<string, string> = {};

  switch (stage) {
    case "readiness": {
      if (!isReadinessComplete(form.readiness)) {
        fieldErrors.readiness = "Complete every readiness item.";
      }
      break;
    }
    case "lookup": {
      if (!form.customerFound) {
        fieldErrors.customerFound = "Select a portal match or new customer.";
      }
      break;
    }
    case "identity": {
      if (!form.name.trim()) fieldErrors.name = "Full name is required.";
      const pErr = phoneError(form.phone);
      if (pErr) fieldErrors.phone = pErr;
      const nidErr = nationalIdFormatErrorMessage(form.idNo);
      if (nidErr) fieldErrors.idNo = nidErr;
      if (!form.county.trim()) fieldErrors.county = "County is required.";
      if (!form.idPhotoFront) fieldErrors.idPhotoFront = "ID front photo is required.";
      if (!form.selfiePhoto) fieldErrors.selfiePhoto = "Selfie is required.";
      break;
    }
    case "dl": {
      if (!form.dlSituation) {
        fieldErrors.dlSituation = "Select the driving licence situation.";
      }
      if (
        form.dlSituation &&
        form.dlSituation !== "none" &&
        !form.dlNumber.trim()
      ) {
        fieldErrors.dlNumber = "DL number is required.";
      }
      break;
    }
    case "cogc": {
      if (!form.cogcSituation) {
        fieldErrors.cogcSituation = "Select the good conduct situation.";
      }
      break;
    }
    case "references": {
      if (!form.refConsent) {
        fieldErrors.refConsent = "Customer consent is required.";
      }
      form.references.forEach((ref, index) => {
        if (!ref.name.trim()) {
          fieldErrors[`references.${index}.name`] = "Name is required.";
        }
        const refPhone = phoneError(ref.phone ?? "");
        if (refPhone) {
          fieldErrors[`references.${index}.phone`] = refPhone;
        }
        if (!ref.relationship.trim()) {
          fieldErrors[`references.${index}.relationship`] =
            "Relationship is required.";
        }
      });
      break;
    }
    case "model": {
      if (!form.opModel) {
        fieldErrors.opModel = "Select an operating model.";
      }
      break;
    }
    case "product": {
      if (!form.productId) {
        fieldErrors.productId = "Select a product.";
      }
      if (!form.stkVerified && form.stkState !== "confirmed") {
        fieldErrors.stkVerified = "Verify deposit via M-Pesa first.";
      }
      const min =
        MIN_DEPOSIT_KES[form.opModel as keyof typeof MIN_DEPOSIT_KES] ?? 0;
      if (form.deposit < min) {
        fieldErrors.deposit = `Minimum deposit is KES ${min.toLocaleString()}.`;
      }
      break;
    }
    case "bike": {
      if (!form.bikeReg) {
        fieldErrors.bikeReg = "Select a bike from inventory.";
      }
      break;
    }
    case "review": {
      if (!isFormReadyForSubmit(form)) {
        fieldErrors.review =
          "Complete every capture section before submitting to operations.";
      }
      break;
    }
    default:
      break;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }
  return { ok: true };
}

export function isCaptureStageComplete(
  stage: CaptureStageKey,
  form: CaptureFormState,
): boolean {
  return validateCaptureStage(stage, form).ok;
}

const PRE_SUBMIT_STAGES: CaptureStageKey[] = CAPTURE_STAGES.map(
  (s) => s.key,
).filter((key) => key !== "review");

/** All wizard stages except review must pass validation before submit. */
export function isFormReadyForSubmit(form: CaptureFormState): boolean {
  return PRE_SUBMIT_STAGES.every((stage) => isCaptureStageComplete(stage, form));
}

export function firstIncompleteSubmitStage(
  form: CaptureFormState,
): CaptureStageKey | null {
  for (const stage of PRE_SUBMIT_STAGES) {
    if (!isCaptureStageComplete(stage, form)) {
      return stage;
    }
  }
  return null;
}
