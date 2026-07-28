import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/onboarding/auth/password/forgot/route";
import { PASSWORD_RESET_REQUEST_MESSAGE } from "@/lib/global/auth/password-reset-copy";

const upstreamForgot = vi.fn();

vi.mock("@/lib/global/auth/officer-auth-upstream", () => ({
  upstreamOfficerPasswordForgot: (...args: unknown[]) => upstreamForgot(...args),
  parseUpstreamJson: async (response: Response) => response.json(),
}));

describe("POST /api/onboarding/auth/password/forgot", () => {
  beforeEach(() => {
    upstreamForgot.mockReset();
  });

  it("returns 200 with generic message when upstream accepts unknown email", async () => {
    upstreamForgot.mockResolvedValue(
      new Response(JSON.stringify({ message: "ok" }), { status: 200 }),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ email: "unknown@contractor.jiwambe.com" }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe("ok");
  });

  it("returns 200 with default message when upstream has no message", async () => {
    upstreamForgot.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ email: "jane@example.com" }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe(PASSWORD_RESET_REQUEST_MESSAGE);
  });

  it("returns 502 when upstream is unavailable", async () => {
    upstreamForgot.mockResolvedValue(
      new Response(JSON.stringify({ error: "server_error" }), { status: 503 }),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ email: "jane@example.com" }),
      }),
    );

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("upstream_unavailable");
  });

  it("forwards 429 from upstream", async () => {
    upstreamForgot.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "rate_limited",
          message: "Slow down",
        }),
        { status: 429 },
      ),
    );

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ email: "jane@example.com" }),
      }),
    );

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.message).toBe("Slow down");
  });
});
