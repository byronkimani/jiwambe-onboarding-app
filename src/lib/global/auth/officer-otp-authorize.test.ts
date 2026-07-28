import { describe, expect, it } from "vitest";
import { mapUpstreamOtpVerifyToUser } from "@/lib/global/auth/officer-otp-authorize";
import { OtpVerifyError } from "@/lib/global/auth/otp-verify-error";

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("mapUpstreamOtpVerifyToUser", () => {
  it("returns user on success", () => {
    const user = mapUpstreamOtpVerifyToUser(
      "agent@jiwambe.com",
      jsonResponse(200, {
        access_token: "at",
        refresh_token: "rt",
        expires_in: 3600,
        officer: { email: "agent@jiwambe.com", name: "Agent" },
      }),
      {
        access_token: "at",
        refresh_token: "rt",
        expires_in: 3600,
        officer: { email: "agent@jiwambe.com", name: "Agent" },
      },
    );
    expect(user.accessToken).toBe("at");
    expect(user.email).toBe("agent@jiwambe.com");
  });

  it("throws SESSION_MISMATCH when officer email differs", () => {
    expect(() =>
      mapUpstreamOtpVerifyToUser(
        "agent@jiwambe.com",
        jsonResponse(200, {}),
        {
          access_token: "at",
          refresh_token: "rt",
          expires_in: 3600,
          officer: { email: "other@jiwambe.com", name: "Other" },
        },
      ),
    ).toThrow(OtpVerifyError);
    try {
      mapUpstreamOtpVerifyToUser(
        "agent@jiwambe.com",
        jsonResponse(200, {}),
        {
          access_token: "at",
          refresh_token: "rt",
          expires_in: 3600,
          officer: { email: "other@jiwambe.com", name: "Other" },
        },
      );
    } catch (e) {
      expect(e).toBeInstanceOf(OtpVerifyError);
      expect((e as OtpVerifyError).code).toBe("SESSION_MISMATCH");
    }
  });

  it("throws RATE_LIMITED on 429", () => {
    try {
      mapUpstreamOtpVerifyToUser(
        "a@b.co",
        jsonResponse(429, { message: "Wait" }),
        { message: "Wait" },
      );
    } catch (e) {
      expect((e as OtpVerifyError).code).toBe("RATE_LIMITED");
    }
  });

  it("throws TOO_MANY_ATTEMPTS when retries_remaining is 0", () => {
    try {
      mapUpstreamOtpVerifyToUser(
        "a@b.co",
        jsonResponse(401, { retries_remaining: 0 }),
        { retries_remaining: 0 },
      );
    } catch (e) {
      expect((e as OtpVerifyError).code).toBe("TOO_MANY_ATTEMPTS");
    }
  });
});
