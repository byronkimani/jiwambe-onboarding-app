import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "@/app/api/onboarding/applications/current/route";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("applications current route", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("GET returns application from upstream", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(JSON.stringify({ application: SAMPLE_APPLICATION_RESOURCE }), {
        status: 200,
      }),
    );

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.application.referenceCode).toBe("A-1042");
  });

  it("GET returns 404 when upstream has no open application", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(JSON.stringify({ error: "not_found" }), { status: 404 }),
    );

    const response = await GET();
    expect(response.status).toBe(404);
  });

  it("GET returns 401 when upstream unauthorized", async () => {
    onboardingUpstream.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await GET();
    expect(response.status).toBe(401);
  });
});
