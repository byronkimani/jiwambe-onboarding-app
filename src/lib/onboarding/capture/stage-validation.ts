import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { CAPTURE_STAGES } from "@/lib/onboarding/capture/stages";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import type { DocumentUploadState } from "@/lib/onboarding/capture/document-upload-state";
import { isDocumentUploadBlockingForPurposes } from "@/lib/onboarding/capture/document-upload-state";
import {
  documentValidationErrorsForStage,
  getRequiredDocumentPurposesForStage,
  kraPinFormatErrorMessage,
} from "@/lib/onboarding/capture/capture-document-requirements";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";
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

function emailError(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return null;
}

function validateModelStage(form: CaptureFormState): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  if (!form.opModel) {
    fieldErrors.opModel = "Select an operating model.";
    return fieldErrors;
  }

  if (form.opModel === "FLEET") {
    if (!form.boltActive) {
      fieldErrors.boltActive = "Select whether the customer is an active Bolt driver.";
    } else if (form.boltActive === "no") {
      fieldErrors.boltActive =
        "Customer is not an active Bolt driver — save and pause below.";
    }
  }

  if (form.opModel === "STAGE") {
    if (!form.stageName.trim()) {
      fieldErrors.stageName = "Stage name is required.";
    }
    if (!form.chairName.trim()) {
      fieldErrors.chairName = "Chairperson name is required.";
    }
    const chairPhoneErr = phoneError(form.chairPhone);
    if (chairPhoneErr) {
      fieldErrors.chairPhone = chairPhoneErr;
    }
    if (!form.chairCalled) {
      fieldErrors.chairCalled = "Confirm you called the chairperson.";
    }
    if (!form.chairOutcome) {
      fieldErrors.chairOutcome = "Select the call outcome.";
    } else if (form.chairOutcome === "unreachable") {
      fieldErrors.chairOutcome =
        "Chairperson unreachable — save and pause below.";
    } else if (form.chairOutcome === "denied") {
      fieldErrors.chairOutcome =
        "Chairperson denied membership — disqualify below.";
    } else if (form.chairOutcome !== "confirmed") {
      fieldErrors.chairOutcome = "Chairperson must confirm stage membership.";
    }
  }

  if (form.opModel === "DELIVERY") {
    if (!form.worksPlatform) {
      fieldErrors.worksPlatform = "Select whether the customer works on a platform.";
    } else if (form.worksPlatform === "no") {
      fieldErrors.worksPlatform =
        "Customer does not work on a platform — save and pause below.";
    } else if (form.worksPlatform === "yes") {
      if (!form.platformName.trim()) {
        fieldErrors.platformName = "Platform or employer name is required.";
      }
      if (!form.platformContact.trim()) {
        fieldErrors.platformContact = "Contact is required.";
      }
      if (!form.verifyConsent) {
        fieldErrors.verifyConsent = "Verification consent is required.";
      }
    }
  }

  if (form.opModel === "PERSONAL") {
    if (!form.isEmployed) {
      fieldErrors.isEmployed = "Select employment or business status.";
    } else if (form.isEmployed === "no") {
      if (!form.verifyConsent) {
        fieldErrors.verifyConsent =
          "Residence verification consent is required.";
      }
    } else if (form.isEmployed === "yes") {
      if (!form.employerName.trim()) {
        fieldErrors.employerName = "Employer or business name is required.";
      }
      if (!form.employerContact.trim()) {
        fieldErrors.employerContact = "Contact is required.";
      }
      if (!form.verifyConsent) {
        fieldErrors.verifyConsent = "Verification consent is required.";
      }
    }
  }

  return fieldErrors;
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
      } else if (form.customerFound === "portal" && !form.selectedLeadId) {
        fieldErrors.customerFound = "Select a portal match from search results.";
      }
      break;
    }
    case "identity": {
      if (!form.name.trim()) fieldErrors.name = "Full name is required.";
      const pErr = phoneError(form.phone);
      if (pErr) fieldErrors.phone = pErr;
      const nidErr = nationalIdFormatErrorMessage(form.idNo);
      if (nidErr) fieldErrors.idNo = nidErr;
      const kraErr = kraPinFormatErrorMessage(form.kraPin);
      if (kraErr) fieldErrors.kraPin = kraErr;
      if (!form.gender.trim()) fieldErrors.gender = "Gender is required.";
      if (!form.dateOfBirth.trim()) {
        fieldErrors.dateOfBirth = "Date of birth is required.";
      }
      const mailErr = emailError(form.email);
      if (mailErr) fieldErrors.email = mailErr;
      if (!form.county.trim()) fieldErrors.county = "County is required.";
      Object.assign(fieldErrors, documentValidationErrorsForStage(stage, form));
      break;
    }
    case "dl": {
      if (!form.dlSituation) {
        fieldErrors.dlSituation = "Select the driving licence situation.";
      } else if (form.dlSituation === "none") {
        fieldErrors.dlSituation =
          "Customer has no driving licence — save and pause below to refer for sponsorship.";
      } else if (!form.dlNumber.trim()) {
        fieldErrors.dlNumber = "DL number is required.";
      }
      Object.assign(fieldErrors, documentValidationErrorsForStage(stage, form));
      break;
    }
    case "cogc": {
      if (!form.cogcSituation) {
        fieldErrors.cogcSituation = "Select the good conduct situation.";
      } else if (form.cogcSituation === "none") {
        fieldErrors.cogcSituation =
          "Good conduct not started — save and pause below to advise DCI application.";
      }
      Object.assign(fieldErrors, documentValidationErrorsForStage(stage, form));
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
        const refNidErr = nationalIdFormatErrorMessage(ref.nationalId);
        if (refNidErr) {
          fieldErrors[`references.${index}.nationalId`] = refNidErr;
        }
      });
      break;
    }
    case "model": {
      Object.assign(fieldErrors, validateModelStage(form));
      Object.assign(fieldErrors, documentValidationErrorsForStage(stage, form));
      break;
    }
    case "product": {
      if (!form.productId) {
        fieldErrors.productId = "Select a product.";
      }
      if (!form.stkVerified && form.stkState !== "confirmed") {
        fieldErrors.stkVerified = "Verify deposit via M-Pesa first.";
      }
      if (
        form.productId &&
        form.quoteMinDepositKes == null &&
        !form.stkVerified &&
        form.stkState !== "confirmed"
      ) {
        fieldErrors.deposit =
          "Wait for the server quote before continuing (select product and deposit).";
      } else if (
        form.quoteMinDepositKes != null &&
        form.deposit < form.quoteMinDepositKes
      ) {
        fieldErrors.deposit = `Minimum deposit is KES ${form.quoteMinDepositKes.toLocaleString()} (from quote).`;
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

export function stageBlockedByDocumentUploads(
  stage: CaptureStageKey,
  form: CaptureFormState,
  documentUploads: DocumentUploadState,
): boolean {
  const required = getRequiredDocumentPurposesForStage(stage, form);
  return isDocumentUploadBlockingForPurposes(documentUploads, required);
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
