import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "@/app/api/catalog/products/route";
import { getSeedCatalogProducts } from "@/lib/onboarding/fixtures/catalog-fixtures";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("GET /api/catalog/products", () => {
  const request = new Request("http://localhost/api/catalog/products");

  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("returns products from upstream", async () => {
    const products = getSeedCatalogProducts();
    onboardingUpstream.mockResolvedValue(
      new Response(JSON.stringify({ products }), { status: 200 }),
    );

    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.products[0].label).toBe("Spiro TVS");
    expect(onboardingUpstream).toHaveBeenCalledWith(
      "/catalog/products",
      { method: "GET" },
      request,
    );
  });

  it("returns 401 when upstream unauthorized", async () => {
    onboardingUpstream.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
