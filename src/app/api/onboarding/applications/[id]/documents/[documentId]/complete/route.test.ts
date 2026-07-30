import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { POST } from "@/app/api/onboarding/applications/[id]/documents/[documentId]/complete/route";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("POST /api/onboarding/applications/:id/documents/:documentId/complete", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("returns 401 when session is missing", async () => {
    onboardingUpstream.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "A-1042", documentId: "doc_1" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns application envelope from upstream", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(JSON.stringify({ application: SAMPLE_APPLICATION_RESOURCE }), {
        status: 200,
      }),
    );

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "A-1042", documentId: "doc_1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.application.referenceCode).toBe("A-1042");
  });
});
