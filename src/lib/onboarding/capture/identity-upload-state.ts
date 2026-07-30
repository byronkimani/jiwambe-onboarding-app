export type IdentityUploadPurpose = "id_front" | "selfie";

export type IdentityUploadStatus = "idle" | "uploading" | "uploaded" | "failed";

export type IdentityUploadSlot = {
  status: IdentityUploadStatus;
  pendingFile: File | null;
  error: string | null;
};

export type IdentityUploadState = Record<
  IdentityUploadPurpose,
  IdentityUploadSlot
>;

export const IDENTITY_UPLOAD_PURPOSES: IdentityUploadPurpose[] = [
  "id_front",
  "selfie",
];

export function createEmptyIdentityUploadState(): IdentityUploadState {
  return {
    id_front: { status: "idle", pendingFile: null, error: null },
    selfie: { status: "idle", pendingFile: null, error: null },
  };
}

export function isIdentityUploadBlocking(state: IdentityUploadState): boolean {
  return IDENTITY_UPLOAD_PURPOSES.some(
    (purpose) =>
      state[purpose].status === "uploading" || state[purpose].status === "failed",
  );
}

export function hasIdentityUploadDirtyExtra(state: IdentityUploadState): boolean {
  return IDENTITY_UPLOAD_PURPOSES.some((purpose) => {
    const slot = state[purpose];
    return (
      slot.status === "uploading" ||
      slot.status === "failed" ||
      slot.pendingFile !== null
    );
  });
}

export function syncIdentityUploadStateFromForm(input: {
  idPhotoFrontDocId: string | null;
  selfiePhotoDocId: string | null;
}): IdentityUploadState {
  const base = createEmptyIdentityUploadState();
  if (input.idPhotoFrontDocId) {
    base.id_front.status = "uploaded";
  }
  if (input.selfiePhotoDocId) {
    base.selfie.status = "uploaded";
  }
  return base;
}
