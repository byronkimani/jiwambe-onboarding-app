import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/v1/field/applications/[id]/agreement/route";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("POST /v1/field/applications/:id/agreement", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("returns 400 on invalid body", async () => {
    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ action: "invalid" }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );
    expect(response.status).toBe(400);
  });

  it("proxies agreement generate action", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(JSON.stringify({ application: SAMPLE_APPLICATION_RESOURCE }), {
        status: 200,
      }),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ action: "generate" }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );
    expect(response.status).toBe(200);
  });
});
