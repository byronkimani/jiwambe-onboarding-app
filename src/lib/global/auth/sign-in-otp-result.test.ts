import { describe, expect, it } from "vitest";
import { otpSignInFailureFromDetails } from "@/lib/global/auth/sign-in-otp-result";

describe("sign-in-otp-result", () => {
  it("maps INVALID_CODE to invalid_otp with retries_remaining", () => {
    const result = otpSignInFailureFromDetails({
      code: "INVALID_CODE",
      message: "Bad",
      attemptsRemaining: 3,
    });
    expect(result).toEqual({
      ok: false,
      error: "invalid_otp",
      message: "Bad",
      retries_remaining: 3,
    });
  });

  it("maps RATE_LIMITED to rate_limited", () => {
    const result = otpSignInFailureFromDetails({
      code: "RATE_LIMITED",
      message: "Slow",
    });
    expect(result.error).toBe("rate_limited");
  });
});
