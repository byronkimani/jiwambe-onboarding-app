import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { POST as stkPost } from "@/app/api/onboarding/deposits/stk/route";
import { POST as validatePost } from "@/app/api/onboarding/deposits/validate/route";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("deposits BFF routes", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("POST stk proxies upstream", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(
        JSON.stringify({
          checkoutId: "ws_test",
          status: "waiting",
        }),
        { status: 200 },
      ),
    );
    const response = await stkPost(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          applicationReferenceCode: "A-2001",
          depositKes: 5000,
        }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.checkoutId).toBe("ws_test");
  });

  it("POST validate rejects invalid body", async () => {
    const response = await validatePost(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ applicationReferenceCode: "A-1" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("POST validate proxies upstream", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(
        JSON.stringify({ status: "verified", depositPayment: null }),
        { status: 200 },
      ),
    );
    const response = await validatePost(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          applicationReferenceCode: "A-2001",
          mpesaReceipt: "UGE2ETEST01",
        }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("verified");
  });
});
