import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "@/app/api/inventory/route";
import {
  DEFAULT_INVENTORY_RULES,
  getSeedInventoryItems,
} from "@/lib/onboarding/inventory/inventory-catalog";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("GET /api/inventory", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("returns inventory from upstream", async () => {
    const items = getSeedInventoryItems();
    onboardingUpstream.mockResolvedValue(
      new Response(
        JSON.stringify({ items, rules: DEFAULT_INVENTORY_RULES }),
        { status: 200 },
      ),
    );

    const response = await GET(new Request("http://localhost/api/inventory"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items.length).toBeGreaterThan(0);
    expect(onboardingUpstream).toHaveBeenCalledWith("/inventory", {
      method: "GET",
    });
  });

  it("returns 401 when upstream unauthorized", async () => {
    onboardingUpstream.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const response = await GET(new Request("http://localhost/api/inventory"));
    expect(response.status).toBe(401);
  });
});
