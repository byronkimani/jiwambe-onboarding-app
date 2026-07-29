import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { POST } from "@/app/api/onboarding/applications/[id]/disqualify/route";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("POST /api/onboarding/applications/:id/disqualify", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("returns 400 on invalid body", async () => {
    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ reason: "no" }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );
    expect(response.status).toBe(400);
  });

  it("proxies disqualify and returns application", async () => {
    const disqualified = {
      ...SAMPLE_APPLICATION_RESOURCE,
      lifecycleState: "DISQUALIFIED" as const,
    };
    onboardingUpstream.mockResolvedValue(
      new Response(JSON.stringify({ application: disqualified }), {
        status: 200,
      }),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ reason: "Failed reference verification" }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.application.lifecycleState).toBe("DISQUALIFIED");
  });

  it("returns 401 when upstream unauthorized", async () => {
    onboardingUpstream.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ reason: "Failed reference verification" }),
      }),
      { params: Promise.resolve({ id: "A-1042" }) },
    );
    expect(response.status).toBe(401);
  });
});
