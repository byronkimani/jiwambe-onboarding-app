import { NextResponse } from "next/server";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/catalog/quotes/route";

const upstreamMock = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => upstreamMock(...args),
}));

describe("POST /api/catalog/quotes", () => {
  beforeEach(() => {
    upstreamMock.mockReset();
    upstreamMock.mockResolvedValue(new Response(null, { status: 404 }));
  });

  it("returns 401 when upstream session is missing", async () => {
    upstreamMock.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const response = await POST(
      new Request("http://localhost/api/catalog/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "spiro-tv",
          depositKes: 15000,
          termMonths: 18,
          operatingModel: "FLEET",
        }),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid operating model", async () => {
    const response = await POST(
      new Request("http://localhost/api/catalog/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "spiro-tv",
          depositKes: 15000,
          termMonths: 18,
          operatingModel: "INVALID",
        }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns a local quote when upstream is unavailable", async () => {
    const response = await POST(
      new Request("http://localhost/api/catalog/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "spiro-tv",
          depositKes: 15000,
          termMonths: 18,
          operatingModel: "FLEET",
        }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.dailyAmountKes).toBeGreaterThan(0);
    expect(body.minDepositKes).toBe(5000);
  });

  it("proxies upstream quote when available", async () => {
    upstreamMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          productId: "spiro-tv",
          depositKes: 15000,
          termMonths: 18,
          operatingModel: "FLEET",
          dailyAmountKes: 499,
          minDepositKes: 5000,
          currency: "KES",
        }),
        { status: 200 },
      ),
    );
    const response = await POST(
      new Request("http://localhost/api/catalog/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "spiro-tv",
          depositKes: 15000,
          termMonths: 18,
          operatingModel: "FLEET",
        }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.dailyAmountKes).toBe(499);
  });
});
