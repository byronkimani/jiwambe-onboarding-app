import { describe, expect, it } from "vitest";
import { documentFromPurpose } from "@/lib/onboarding/documents/document-slot-map";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";

describe("documentFromPurpose", () => {
  it("resolves customer and licence documents", () => {
    expect(documentFromPurpose(SAMPLE_APPLICATION_RESOURCE, "id_back")?.documentId).toBe(
      "doc_02",
    );
    expect(
      documentFromPurpose(SAMPLE_APPLICATION_RESOURCE, "kra_certificate")?.url,
    ).toContain("kra.pdf");
    expect(
      documentFromPurpose(SAMPLE_APPLICATION_RESOURCE, "dl_front")?.documentId,
    ).toBe("doc_05");
  });
});
