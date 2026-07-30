import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { POST } from "@/app/api/customers/search/route";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("POST /api/customers/search", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("returns 400 for invalid body", async () => {
    const response = await POST(
      new Request("http://localhost/api/customers/search", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("proxies upstream search by phone", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(
        JSON.stringify({
          matches: [
            {
              leadId: "lead_1",
              source: "portal",
              displayName: "Grace Wanjiku",
              phoneMasked: "07•• ••• 556",
              nationalIdMasked: "•••• 9912",
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const response = await POST(
      new Request("http://localhost/api/customers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+254712334556" }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.matches).toHaveLength(1);
    expect(onboardingUpstream).toHaveBeenCalledWith(
      "/customers/search",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns 401 when upstream unauthorized", async () => {
    onboardingUpstream.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const response = await POST(
      new Request("http://localhost/api/customers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+254712334556" }),
      }),
    );
    expect(response.status).toBe(401);
  });
});
