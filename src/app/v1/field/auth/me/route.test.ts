import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "@/app/v1/field/auth/me/route";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

vi.mock("@/lib/global/shared/env", () => ({
  isMockJiwambeApiEnabled: () => true,
}));

describe("GET /v1/field/auth/me", () => {
  const request = new Request("http://localhost/v1/field/auth/me");

  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("returns 401 when upstream session is missing", async () => {
    onboardingUpstream.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("returns profile from upstream when available", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "agent-1",
          name: "Jane",
          role: "Field Officer",
          dealership: "Ruiru Hub",
          dealershipId: "hub_ruiru",
          phone: "254700100000",
          email: "jane@jiwambe.com",
          registeredPhone: "0712 000 000",
          nationalIdMask: "•••• 1234",
          deviceLabel: "Tablet",
          lastSignIn: "Today",
        }),
        { status: 200 },
      ),
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.profile.email).toBe("jane@jiwambe.com");
  });

  it("falls back to seed profile when upstream fails in mock mode", async () => {
    onboardingUpstream.mockResolvedValue(new Response(null, { status: 404 }));
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.profile.dealership).toBe("Ruiru Hub");
  });
});
