import { describe, expect, it } from "vitest";
import {
  extractOtpVerifyDetailsFromUnknown,
  OtpVerifyError,
  parseOtpVerifyErrorDetails,
} from "@/lib/global/auth/otp-verify-error";

describe("otp-verify-error", () => {
  it("round-trips details through error message JSON", () => {
    const err = new OtpVerifyError({
      code: "INVALID_CODE",
      message: "Wrong code",
      attemptsRemaining: 2,
    });
    const parsed = parseOtpVerifyErrorDetails(err.message);
    expect(parsed?.code).toBe("INVALID_CODE");
    expect(parsed?.attemptsRemaining).toBe(2);
  });

  it("extracts from OtpVerifyError instance", () => {
    const err = new OtpVerifyError({
      code: "RATE_LIMITED",
      message: "Slow down",
    });
    expect(extractOtpVerifyDetailsFromUnknown(err)?.code).toBe("RATE_LIMITED");
  });

  it("walks error cause chain", () => {
    const inner = new OtpVerifyError({
      code: "TOO_MANY_ATTEMPTS",
      message: "No tries left",
      attemptsRemaining: 0,
    });
    const outer = new Error("wrapper", { cause: inner });
    expect(extractOtpVerifyDetailsFromUnknown(outer)?.code).toBe(
      "TOO_MANY_ATTEMPTS",
    );
  });

  it("returns null for unrelated errors", () => {
    expect(extractOtpVerifyDetailsFromUnknown(new Error("nope"))).toBeNull();
  });
});
