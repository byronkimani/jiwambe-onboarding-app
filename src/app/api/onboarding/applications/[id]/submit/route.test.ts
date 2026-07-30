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
    onboardingUpstream
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ application: SAMPLE_APPLICATION_RESOURCE }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
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

  it("returns 422 when BFF pre-check finds blocking issues", async () => {
    const incomplete = {
      ...SAMPLE_APPLICATION_RESOURCE,
      customer: null,
    };
    onboardingUpstream.mockResolvedValueOnce(
      new Response(JSON.stringify({ application: incomplete }), { status: 200 }),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ officerAttestation: true }),
      }),
      { params: Promise.resolve({ id: "A-2000" }) },
    );
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.blockingIssues?.length).toBeGreaterThan(0);
    expect(onboardingUpstream).toHaveBeenCalledTimes(1);
  });

  it("forwards 422 blocking issues from upstream after pre-check passes", async () => {
    onboardingUpstream
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ application: SAMPLE_APPLICATION_RESOURCE }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: "validation_failed",
            blockingIssues: [
              { code: "identity.phone", message: "Phone is required." },
            ],
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
    expect(onboardingUpstream).toHaveBeenCalledTimes(2);
  });
});
