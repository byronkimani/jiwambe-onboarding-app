import type { CaptureStageKey } from "@/lib/global/shared/routes";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import {
  CAPTURE_DOCUMENT_FORM_KEYS,
  formPatchForClearedDocument,
} from "@/lib/onboarding/capture/capture-form-documents";
import type { DocumentPurpose } from "@/lib/onboarding/documents/document-purposes";

const IDENTITY_PURPOSES: DocumentPurpose[] = [
  "id_front",
  "id_back",
  "kra_certificate",
  "selfie",
];

function dlRequiredPurposes(form: CaptureFormState): DocumentPurpose[] {
  switch (form.dlSituation) {
    case "smart":
      return ["dl_front", "dl_back"];
    case "pdl":
      return ["pdl_document"];
    case "processing":
      return ["dl_front", "dl_peleza_report"];
    default:
      return [];
  }
}

function cogcRequiredPurposes(form: CaptureFormState): DocumentPurpose[] {
  switch (form.cogcSituation) {
    case "have":
      return ["cogc_certificate"];
    case "peleza":
      return ["cogc_peleza_report"];
    default:
      return [];
  }
}

function modelRequiredPurposes(form: CaptureFormState): DocumentPurpose[] {
  if (form.opModel === "DELIVERY") {
    if (form.verifyConsent) return ["consent_document"];
    return [];
  }
  if (form.opModel === "PERSONAL") {
    if (form.isEmployed === "yes" && form.verifyConsent) {
      return ["consent_document"];
    }
    return [];
  }
  return [];
}

function modelOptionalPurposes(form: CaptureFormState): DocumentPurpose[] {
  if (form.opModel === "DELIVERY" || form.opModel === "PERSONAL") {
    return ["business_registration"];
  }
  return [];
}

export function getRequiredDocumentPurposesForStage(
  stage: CaptureStageKey,
  form: CaptureFormState,
): DocumentPurpose[] {
  switch (stage) {
    case "identity":
      return IDENTITY_PURPOSES;
    case "dl":
      return dlRequiredPurposes(form);
    case "cogc":
      return cogcRequiredPurposes(form);
    case "model":
      return modelRequiredPurposes(form);
    default:
      return [];
  }
}

export function getOptionalDocumentPurposesForStage(
  stage: CaptureStageKey,
  form: CaptureFormState,
): DocumentPurpose[] {
  if (stage === "model") return modelOptionalPurposes(form);
  return [];
}

/** Purposes that should be cleared when form answers change. */
export function getAllPossibleCapturePurposes(): DocumentPurpose[] {
  return [
    ...IDENTITY_PURPOSES,
    "dl_front",
    "dl_back",
    "pdl_document",
    "dl_peleza_report",
    "cogc_certificate",
    "cogc_peleza_report",
    "consent_document",
    "business_registration",
  ];
}

export function getStaleDocumentPurposesAfterPatch(
  prev: CaptureFormState,
  patch: Partial<CaptureFormState>,
): DocumentPurpose[] {
  const stale: DocumentPurpose[] = [];

  if (patch.dlSituation !== undefined && patch.dlSituation !== prev.dlSituation) {
    stale.push("dl_front", "dl_back", "pdl_document", "dl_peleza_report");
  }

  if (
    patch.cogcSituation !== undefined &&
    patch.cogcSituation !== prev.cogcSituation
  ) {
    stale.push("cogc_certificate", "cogc_peleza_report");
  }

  if (patch.opModel !== undefined && patch.opModel !== prev.opModel) {
    stale.push("consent_document", "business_registration");
  }

  if (patch.verifyConsent === false) {
    stale.push("consent_document");
  }

  if (patch.isEmployed !== undefined && patch.isEmployed !== prev.isEmployed) {
    stale.push("consent_document", "business_registration");
  }

  return [...new Set(stale)];
}

export function buildClearPatchesForPurposes(
  purposes: DocumentPurpose[],
): Partial<CaptureFormState> {
  return purposes.reduce<Partial<CaptureFormState>>((acc, purpose) => {
    return { ...acc, ...formPatchForClearedDocument(purpose) };
  }, {});
}

export function documentValidationFieldKey(
  purpose: DocumentPurpose,
): string {
  const keys = CAPTURE_DOCUMENT_FORM_KEYS[purpose];
  return keys ? String(keys.preview) : purpose;
}

export function documentValidationErrorsForStage(
  stage: CaptureStageKey,
  form: CaptureFormState,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const required = getRequiredDocumentPurposesForStage(stage, form);

  for (const purpose of required) {
    const keys = CAPTURE_DOCUMENT_FORM_KEYS[purpose];
    if (!keys) continue;
    const docId = form[keys.docId] as string | null;
    if (!docId) {
      errors[String(keys.preview)] = "Document must finish uploading.";
    }
  }

  return errors;
}

export function kraPinFormatErrorMessage(kraPin: string): string | null {
  const trimmed = kraPin.trim();
  if (!trimmed) return "KRA PIN is required.";
  if (trimmed.length < 9) return "Enter a valid KRA PIN.";
  return null;
}
