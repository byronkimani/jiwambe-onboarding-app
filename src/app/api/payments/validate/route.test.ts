import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/payments/validate/route";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("POST /api/payments/validate", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("rejects invalid body", async () => {
    const response = await POST(
      new Request("http://localhost/api/payments/validate", {
        method: "POST",
        body: JSON.stringify({ applicationReferenceCode: "A-1" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("proxies upstream M-Pesa receipt validation", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(
        JSON.stringify({ status: "verified", depositPayment: null }),
        { status: 200 },
      ),
    );
    const response = await POST(
      new Request("http://localhost/api/payments/validate", {
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
    expect(onboardingUpstream).toHaveBeenCalledWith(
      "/payments/validate",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
