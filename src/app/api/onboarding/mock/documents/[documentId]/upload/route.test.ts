import { describe, expect, it, vi, beforeEach } from "vitest";
import { PUT } from "@/app/api/onboarding/mock/documents/[documentId]/upload/route";

vi.mock("@/lib/global/shared/env", () => ({
  isMockJiwambeApiEnabled: vi.fn(),
}));

vi.mock("@/mocks/documents-mock-state", () => ({
  mockPutDocument: vi.fn(),
}));

import { isMockJiwambeApiEnabled } from "@/lib/global/shared/env";
import { mockPutDocument } from "@/mocks/documents-mock-state";

describe("PUT /api/onboarding/mock/documents/:documentId/upload", () => {
  beforeEach(() => {
    vi.mocked(isMockJiwambeApiEnabled).mockReturnValue(true);
    vi.mocked(mockPutDocument).mockReset();
  });

  it("returns 404 when mock API is disabled", async () => {
    vi.mocked(isMockJiwambeApiEnabled).mockReturnValue(false);
    const response = await PUT(new Request("http://localhost", { method: "PUT" }), {
      params: Promise.resolve({ documentId: "doc_1" }),
    });
    expect(response.status).toBe(404);
  });

  it("accepts upload bytes in mock mode", async () => {
    vi.mocked(mockPutDocument).mockReturnValue(true);
    const response = await PUT(
      new Request("http://localhost", { method: "PUT", body: "bytes" }),
      { params: Promise.resolve({ documentId: "doc_1" }) },
    );
    expect(response.status).toBe(200);
    expect(mockPutDocument).toHaveBeenCalledWith("doc_1");
  });
});
