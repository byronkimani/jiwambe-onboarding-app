import { describe, expect, it, vi, beforeEach } from "vitest";
import { uploadApplicationDocument } from "@/lib/onboarding/documents/upload-application-document";

const fetchMock = vi.fn();

describe("uploadApplicationDocument", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("runs init → PUT → complete and returns document metadata", async () => {
    const file = new File(["pixels"], "id.jpg", { type: "image/jpeg" });

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            documentId: "doc_1",
            uploadUrl: "https://storage.test/upload/doc_1",
            uploadHeaders: { "x-amz-acl": "private" },
            expiresAt: new Date().toISOString(),
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            application: {
              customer: {
                idFront: {
                  documentId: "doc_1",
                  url: "https://cdn.test/doc_1.jpg",
                  status: "ready",
                },
              },
              id: "app_test",
              referenceCode: "A-1042",
              version: 2,
              lifecycleState: "DRAFT",
              pause: null,
              assignment: {
                officerId: "off_demo",
                officerDisplayName: "Demo",
                dealershipId: "hub",
                dealershipName: "Hub",
              },
              submission: { submittedAt: null, officerAttestation: false },
              operations: { lmsId: null, opsNote: null, flag: null },
              timestamps: {
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
              },
            },
          }),
          { status: 200 },
        ),
      );

    const result = await uploadApplicationDocument({
      applicationId: "A-1042",
      purpose: "id_front",
      file,
    });

    expect(result.documentId).toBe("doc_1");
    expect(result.url).toContain("doc_1");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("rejects unsupported files", async () => {
    const file = new File(["text"], "notes.txt", { type: "text/plain" });
    await expect(
      uploadApplicationDocument({
        applicationId: "A-1042",
        purpose: "id_front",
        file,
      }),
    ).rejects.toThrow(/image or PDF/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts PDF uploads", async () => {
    const file = new File(["pdf"], "kra.pdf", { type: "application/pdf" });
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            documentId: "doc_pdf",
            uploadUrl: "https://storage.test/upload/doc_pdf",
            expiresAt: new Date().toISOString(),
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            application: {
              customer: {
                kraCertificate: {
                  documentId: "doc_pdf",
                  url: "https://cdn.test/doc_pdf.pdf",
                  status: "ready",
                },
              },
              id: "app_test",
              referenceCode: "A-1042",
              version: 2,
              lifecycleState: "DRAFT",
              pause: null,
              assignment: {
                officerId: "off_demo",
                officerDisplayName: "Demo",
                dealershipId: "hub",
                dealershipName: "Hub",
              },
              submission: { submittedAt: null, officerAttestation: false },
              operations: { lmsId: null, opsNote: null, flag: null },
              timestamps: {
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
              },
            },
          }),
          { status: 200 },
        ),
      );

    const result = await uploadApplicationDocument({
      applicationId: "A-1042",
      purpose: "kra_certificate",
      file,
    });
    expect(result.documentId).toBe("doc_pdf");
  });
});
