import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/payments/stk/route";

const onboardingUpstream = vi.fn();

vi.mock("@/lib/global/onboarding/onboarding-bff", () => ({
  onboardingUpstream: (...args: unknown[]) => onboardingUpstream(...args),
}));

describe("POST /api/payments/stk", () => {
  beforeEach(() => {
    onboardingUpstream.mockReset();
  });

  it("proxies upstream", async () => {
    onboardingUpstream.mockResolvedValue(
      new Response(
        JSON.stringify({
          checkoutId: "ws_test",
          status: "waiting",
        }),
        { status: 200 },
      ),
    );
    const response = await POST(
      new Request("http://localhost/api/payments/stk", {
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
    expect(onboardingUpstream).toHaveBeenCalledWith(
      "/payments/stk",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
