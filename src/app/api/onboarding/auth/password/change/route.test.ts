import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/onboarding/auth/password/change/route";

const upstreamChange = vi.fn();
const requireToken = vi.fn();

vi.mock("@/lib/global/auth/officer-auth-upstream", () => ({
  upstreamOfficerPasswordChange: (...args: unknown[]) => upstreamChange(...args),
  parseUpstreamJson: async (response: Response) => response.json(),
}));

vi.mock("@/lib/global/auth/require-onboarding-session", () => ({
  requireOnboardingAccessToken: () => requireToken(),
}));

describe("POST /api/onboarding/auth/password/change", () => {
  beforeEach(() => {
    upstreamChange.mockReset();
    requireToken.mockReset();
  });

  it("returns 401 when session is missing", async () => {
    requireToken.mockResolvedValue({ ok: false });

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          current_password: "oldpass12",
          password: "newpass12",
          password_confirm: "newpass12",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns 400 for weak password", async () => {
    requireToken.mockResolvedValue({ ok: true, accessToken: "tok" });

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          current_password: "demo12345",
          password: "short",
          password_confirm: "short",
        }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("weak_password");
  });

  it("returns 401 when upstream rejects current password", async () => {
    requireToken.mockResolvedValue({ ok: true, accessToken: "tok" });
    upstreamChange.mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid_credentials" }), {
        status: 401,
      }),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          current_password: "wrongpass1",
          password: "newpass12",
          password_confirm: "newpass12",
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(upstreamChange).toHaveBeenCalledWith(
      "tok",
      "wrongpass1",
      "newpass12",
      expect.any(Request),
    );
  });

  it("returns ok when upstream accepts change", async () => {
    requireToken.mockResolvedValue({ ok: true, accessToken: "tok" });
    upstreamChange.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          current_password: "demo12345",
          password: "newpass12",
          password_confirm: "newpass12",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});
