import type { DocumentPurpose } from "@/lib/onboarding/documents/document-purposes";
import { CAPTURE_DOCUMENT_PURPOSES } from "@/lib/onboarding/documents/document-purposes";

export type DocumentUploadStatus = "idle" | "uploading" | "uploaded" | "failed";

export type DocumentUploadSlot = {
  status: DocumentUploadStatus;
  pendingFile: File | null;
  error: string | null;
};

export type DocumentUploadState = Record<DocumentPurpose, DocumentUploadSlot>;

export function createEmptyDocumentUploadState(): DocumentUploadState {
  const state = {} as DocumentUploadState;
  for (const purpose of CAPTURE_DOCUMENT_PURPOSES) {
    state[purpose] = { status: "idle", pendingFile: null, error: null };
  }
  state.handover_photo = { status: "idle", pendingFile: null, error: null };
  return state;
}

export function isDocumentUploadBlocking(state: DocumentUploadState): boolean {
  return CAPTURE_DOCUMENT_PURPOSES.some(
    (purpose) =>
      state[purpose].status === "uploading" ||
      state[purpose].status === "failed",
  );
}

export function isDocumentUploadBlockingForPurposes(
  state: DocumentUploadState,
  purposes: DocumentPurpose[],
): boolean {
  return purposes.some(
    (purpose) =>
      state[purpose].status === "uploading" ||
      state[purpose].status === "failed",
  );
}

export function hasDocumentUploadDirtyExtra(
  state: DocumentUploadState,
): boolean {
  return CAPTURE_DOCUMENT_PURPOSES.some((purpose) => {
    const slot = state[purpose];
    return (
      slot.status === "uploading" ||
      slot.status === "failed" ||
      slot.pendingFile !== null
    );
  });
}

export function syncDocumentUploadStateFromForm(
  docIds: Partial<Record<DocumentPurpose, string | null>>,
): DocumentUploadState {
  const base = createEmptyDocumentUploadState();
  for (const purpose of CAPTURE_DOCUMENT_PURPOSES) {
    if (docIds[purpose]) {
      base[purpose].status = "uploaded";
    }
  }
  return base;
}
