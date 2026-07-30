export const DOCUMENT_PURPOSES = [
  "id_front",
  "id_back",
  "kra_certificate",
  "selfie",
  "dl_front",
  "dl_back",
  "pdl_document",
  "dl_peleza_report",
  "cogc_certificate",
  "cogc_peleza_report",
  "consent_document",
  "business_registration",
  "handover_photo",
] as const;

export type DocumentPurpose = (typeof DOCUMENT_PURPOSES)[number];

/** Purposes wired in the capture wizard (excludes release handover). */
export const CAPTURE_DOCUMENT_PURPOSES = DOCUMENT_PURPOSES.filter(
  (p) => p !== "handover_photo",
);

export const ALLOWED_CAPTURE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/tiff",
] as const;

export const ALLOWED_CAPTURE_DOCUMENT_MIME_TYPES = [
  ...ALLOWED_CAPTURE_IMAGE_MIME_TYPES,
  "application/pdf",
] as const;

/** Per-document upload cap for capture files (8 MB). */
export const MAX_DOCUMENT_BYTE_SIZE = 8 * 1024 * 1024;

const EXTENSION_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".pdf": "application/pdf",
};

export function inferMimeFromFileName(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  for (const [ext, mime] of Object.entries(EXTENSION_MIME)) {
    if (lower.endsWith(ext)) return mime;
  }
  return null;
}

export function resolveCaptureUploadMime(file: File): string {
  if (file.type && isAllowedCaptureDocumentMime(file.type)) {
    return file.type;
  }
  const inferred = inferMimeFromFileName(file.name);
  if (inferred) return inferred;
  return file.type;
}

export function isAllowedCaptureDocumentMime(contentType: string): boolean {
  return (ALLOWED_CAPTURE_DOCUMENT_MIME_TYPES as readonly string[]).includes(
    contentType,
  );
}

export function isAllowedCaptureImageMime(contentType: string): boolean {
  return (ALLOWED_CAPTURE_IMAGE_MIME_TYPES as readonly string[]).includes(
    contentType,
  );
}

export function validateCaptureUploadFile(file: File): string | null {
  const mime = resolveCaptureUploadMime(file);
  if (!isAllowedCaptureDocumentMime(mime)) {
    return "Only image or PDF files are allowed.";
  }
  if (file.size > MAX_DOCUMENT_BYTE_SIZE) {
    return "File must be 8 MB or smaller.";
  }
  if (file.size <= 0) {
    return "File is empty.";
  }
  return null;
}

export function isPdfMime(contentType: string): boolean {
  return contentType === "application/pdf";
}
