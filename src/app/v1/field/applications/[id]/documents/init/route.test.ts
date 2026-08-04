import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { POST } from "@/app/v1/field/applications/[id]/documents/init/route";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("POST /v1/field/applications/:id/documents/init", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("returns 401 when session is missing", async () => {
    onboardingUpstream.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          purpose: "id_front",
          contentType: "image/jpeg",
          byteSize: 1024,
        }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );

    expect(response.status).toBe(401);
  });

  it("returns upload instructions from upstream", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(
        JSON.stringify({
          documentId: "doc_abc",
          uploadUrl: "https://storage.test/doc_abc",
          uploadHeaders: { "x-test": "1" },
          expiresAt: "2026-07-30T12:00:00.000Z",
        }),
        { status: 200 },
      ),
    );

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          purpose: "selfie",
          contentType: "image/jpeg",
          byteSize: 2048,
        }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.documentId).toBe("doc_abc");
  });

  it("returns 400 for invalid body", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ purpose: "id_front" }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );

    expect(response.status).toBe(400);
    expect(onboardingUpstream).not.toHaveBeenCalled();
  });
});
