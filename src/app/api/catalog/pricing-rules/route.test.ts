import { NextResponse } from "next/server";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/catalog/pricing-rules/route";

const upstreamMock = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => upstreamMock(...args),
}));

describe("GET /api/catalog/pricing-rules", () => {
  beforeEach(() => {
    upstreamMock.mockReset();
    upstreamMock.mockResolvedValue(new Response(null, { status: 404 }));
  });

  it("returns 401 when upstream session is missing", async () => {
    upstreamMock.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns local rules when upstream is unavailable", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.operatingModels.length).toBeGreaterThan(0);
    expect(body.operatingModels[0].minDepositKes).toBeGreaterThan(0);
  });

  it("proxies upstream pricing rules when available", async () => {
    upstreamMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          operatingModels: [
            { operatingModel: "FLEET", label: "Fleet", minDepositKes: 6000 },
          ],
          currency: "KES",
        }),
        { status: 200 },
      ),
    );
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.operatingModels[0].minDepositKes).toBe(6000);
  });
});
