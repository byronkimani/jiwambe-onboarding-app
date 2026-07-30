import { describe, expect, it } from "vitest";
import {
  isAllowedCaptureDocumentMime,
  inferMimeFromFileName,
  validateCaptureUploadFile,
  MAX_DOCUMENT_BYTE_SIZE,
} from "@/lib/onboarding/documents/document-purposes";

describe("document-purposes", () => {
  it("allows common image and PDF mime types", () => {
    expect(isAllowedCaptureDocumentMime("image/jpeg")).toBe(true);
    expect(isAllowedCaptureDocumentMime("application/pdf")).toBe(true);
    expect(isAllowedCaptureDocumentMime("text/plain")).toBe(false);
  });

  it("infers mime from file extension when type is empty", () => {
    expect(inferMimeFromFileName("certificate.pdf")).toBe("application/pdf");
    expect(inferMimeFromFileName("scan.heic")).toBe("image/heic");
  });

  it("accepts PDF files via extension fallback", () => {
    const file = new File(["pdf"], "kra.pdf", { type: "" });
    expect(validateCaptureUploadFile(file)).toBeNull();
  });

  it("rejects oversize files", () => {
    const file = new File([new Uint8Array(MAX_DOCUMENT_BYTE_SIZE + 1)], "big.jpg", {
      type: "image/jpeg",
    });
    expect(validateCaptureUploadFile(file)).toMatch(/8 MB/i);
  });
});
