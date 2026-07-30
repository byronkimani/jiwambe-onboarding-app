import { describe, expect, it } from "vitest";
import { patchDocumentField } from "@/lib/onboarding/capture/capture-document-patch";

describe("patchDocumentField", () => {
  it("returns null for blob URLs", () => {
    expect(patchDocumentField("doc_1", "blob:http://localhost/abc")).toBeNull();
  });

  it("returns null without document id", () => {
    expect(patchDocumentField(null, "https://cdn.test/doc.jpg")).toBeNull();
  });

  it("returns ready document when id and https url present", () => {
    expect(patchDocumentField("doc_1", "https://cdn.test/doc.jpg")).toEqual({
      documentId: "doc_1",
      url: "https://cdn.test/doc.jpg",
      status: "ready",
    });
  });
});
