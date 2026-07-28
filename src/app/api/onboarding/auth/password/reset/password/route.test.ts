import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/onboarding/auth/password/reset/password/route";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => undefined,
    set: vi.fn(),
  })),
}));

describe("POST /api/onboarding/auth/password/reset/password", () => {
  it("returns 410 when reset session cookie is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          password: "longenough",
          password_confirm: "longenough",
        }),
      }),
    );

    expect(response.status).toBe(410);
    const body = await response.json();
    expect(body.error).toBe("reset_expired");
  });
});
