import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET, POST } from "@/app/api/onboarding/applications/route";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";
import { mapResourceToSummary } from "@/lib/onboarding/map-resource-to-summary";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
  requireOnboardingUpstream: vi.fn(),
}));

describe("applications route", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("GET returns summaries from upstream", async () => {
    const summary = mapResourceToSummary(SAMPLE_APPLICATION_RESOURCE);
    onboardingUpstream.mockResolvedValue(
      new Response(JSON.stringify({ applications: [summary] }), {
        status: 200,
      }),
    );

    const response = await GET(new Request("http://localhost/api"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.applications[0].referenceCode).toBe("A-1042");
  });

  it("GET returns 401 when upstream returns unauthorized response", async () => {
    onboardingUpstream.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await GET(new Request("http://localhost/api"));
    expect(response.status).toBe(401);
  });

  it("POST returns 400 on invalid body", async () => {
    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ readinessAttestations: {} }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("POST creates application via upstream", async () => {
    upstreamUpstreamCreate();
    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          readinessAttestations: {
            hasId: true,
            knowsKra: true,
            dlKnown: true,
            cogcKnown: true,
            hasFunds: true,
            refsBriefed: true,
          },
        }),
      }),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.application.referenceCode).toBeTruthy();
  });
});

function upstreamUpstreamCreate() {
  onboardingUpstream.mockResolvedValue(
    new Response(
      JSON.stringify({
        application: {
          ...SAMPLE_APPLICATION_RESOURCE,
          id: "app_new",
          referenceCode: "A-2999",
          version: 1,
          lifecycleState: "DRAFT",
        },
      }),
      { status: 201 },
    ),
  );
}
