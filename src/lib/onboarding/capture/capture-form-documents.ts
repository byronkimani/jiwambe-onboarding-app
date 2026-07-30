import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import type { DocumentPurpose } from "@/lib/onboarding/documents/document-purposes";

export type CaptureDocumentFormKeys = {
  preview: keyof CaptureFormState;
  docId: keyof CaptureFormState;
};

export const CAPTURE_DOCUMENT_FORM_KEYS: Record<
  DocumentPurpose,
  CaptureDocumentFormKeys | null
> = {
  id_front: { preview: "idPhotoFront", docId: "idPhotoFrontDocId" },
  id_back: { preview: "idPhotoBack", docId: "idPhotoBackDocId" },
  kra_certificate: {
    preview: "kraCertificatePhoto",
    docId: "kraCertificateDocId",
  },
  selfie: { preview: "selfiePhoto", docId: "selfiePhotoDocId" },
  dl_front: { preview: "dlFrontPhoto", docId: "dlFrontDocId" },
  dl_back: { preview: "dlBackPhoto", docId: "dlBackDocId" },
  pdl_document: { preview: "pdlDocumentPhoto", docId: "pdlDocumentDocId" },
  dl_peleza_report: {
    preview: "dlPelezaReportPhoto",
    docId: "dlPelezaReportDocId",
  },
  cogc_certificate: {
    preview: "cogcCertificatePhoto",
    docId: "cogcCertificateDocId",
  },
  cogc_peleza_report: {
    preview: "cogcPelezaReportPhoto",
    docId: "cogcPelezaReportDocId",
  },
  consent_document: {
    preview: "consentDocumentPhoto",
    docId: "consentDocumentDocId",
  },
  business_registration: {
    preview: "businessRegistrationPhoto",
    docId: "businessRegistrationDocId",
  },
  handover_photo: null,
};

export function previewAndDocIdFromForm(
  form: CaptureFormState,
  purpose: DocumentPurpose,
): { preview: string | null; docId: string | null } {
  const keys = CAPTURE_DOCUMENT_FORM_KEYS[purpose];
  if (!keys) return { preview: null, docId: null };
  return {
    preview: form[keys.preview] as string | null,
    docId: form[keys.docId] as string | null,
  };
}

export function formPatchForUploadedDocument(
  purpose: DocumentPurpose,
  url: string,
  documentId: string | null,
): Partial<CaptureFormState> {
  const keys = CAPTURE_DOCUMENT_FORM_KEYS[purpose];
  if (!keys) return {};
  return {
    [keys.preview]: url,
    [keys.docId]: documentId,
  } as Partial<CaptureFormState>;
}

export function formPatchForClearedDocument(
  purpose: DocumentPurpose,
): Partial<CaptureFormState> {
  const keys = CAPTURE_DOCUMENT_FORM_KEYS[purpose];
  if (!keys) return {};
  return {
    [keys.preview]: null,
    [keys.docId]: null,
  } as Partial<CaptureFormState>;
}

export function allCaptureDocIdsFromForm(
  form: CaptureFormState,
): Partial<Record<DocumentPurpose, string | null>> {
  const out: Partial<Record<DocumentPurpose, string | null>> = {};
  for (const [purpose, keys] of Object.entries(CAPTURE_DOCUMENT_FORM_KEYS)) {
    if (!keys) continue;
    out[purpose as DocumentPurpose] = form[keys.docId] as string | null;
  }
  return out;
}
