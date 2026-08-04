import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/v1/field/auth/logout/route";

const requireRefresh = vi.fn();
const upstreamLogout = vi.fn();

vi.mock("@/lib/global/auth/require-onboarding-session", () => ({
  requireOnboardingRefreshToken: () => requireRefresh(),
}));

vi.mock("@/lib/global/auth/officer-auth-upstream", () => ({
  upstreamOfficerLogout: (...args: unknown[]) => upstreamLogout(...args),
  parseUpstreamJson: async (response: Response) => response.json(),
}));

describe("POST /v1/field/auth/logout", () => {
  const request = new Request("http://localhost/v1/field/auth/logout", {
    method: "POST",
  });

  beforeEach(() => {
    requireRefresh.mockReset();
    upstreamLogout.mockReset();
  });

  it("returns 401 without session", async () => {
    requireRefresh.mockResolvedValue({ ok: false });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("revokes refresh token when session exists", async () => {
    requireRefresh.mockResolvedValue({ ok: true, refreshToken: "rt_1" });
    upstreamLogout.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(upstreamLogout).toHaveBeenCalledWith("rt_1", request);
  });
});
