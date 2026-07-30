import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/onboarding/applications/[id]/submit/route";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("POST /api/onboarding/applications/:id/submit", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("returns 400 on invalid body", async () => {
    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ officerAttestation: false }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );
    expect(response.status).toBe(400);
  });

  it("proxies submit and returns application", async () => {
    const submitted = {
      ...SAMPLE_APPLICATION_RESOURCE,
      lifecycleState: "OPS_REVIEW" as const,
    };
    onboardingUpstream.mockResolvedValue(
      new Response(JSON.stringify({ application: submitted }), { status: 200 }),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ officerAttestation: true }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.application.lifecycleState).toBe("OPS_REVIEW");
  });

  it("forwards 422 blocking issues from upstream", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "validation_failed",
          blockingIssues: [{ code: "identity.phone", message: "Phone is required." }],
        }),
        { status: 422 },
      ),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "A-2000" }) },
    );
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.blockingIssues).toHaveLength(1);
  });
});
