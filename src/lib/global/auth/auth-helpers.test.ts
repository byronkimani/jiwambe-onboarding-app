import { describe, expect, it } from "vitest";
import {
  DEMO_AGENT_EMAIL,
  DEMO_AGENT_PASSWORD,
  DEMO_OTP_CODE,
} from "@/lib/global/auth/demo-credentials";
import {
  emailFormatErrorMessage,
  isValidEmailFormat,
  normalizeEmail,
} from "@/lib/global/auth/normalize-email";
import { validateNewPassword } from "@/lib/global/auth/validate-password";

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Jane@Example.COM ")).toBe("jane@example.com");
  });

  it("validates email format", () => {
    expect(isValidEmailFormat("a@b.co")).toBe(true);
    expect(isValidEmailFormat("not-an-email")).toBe(false);
  });

  it("returns email field error messages", () => {
    expect(emailFormatErrorMessage("")).toMatch(/enter your email/i);
    expect(emailFormatErrorMessage("bad")).toMatch(/valid email/i);
    expect(emailFormatErrorMessage("john@jiwambe.com")).toBeNull();
  });
});

describe("validateNewPassword", () => {
  it("accepts matching passwords meeting min length", () => {
    expect(validateNewPassword("longenough", "longenough").ok).toBe(true);
  });

  it("rejects mismatch", () => {
    const result = validateNewPassword("longenough", "different");
    expect(result.ok).toBe(false);
  });
});

describe("demo credentials", () => {
  it("exposes stable demo agent values", () => {
    expect(DEMO_AGENT_EMAIL).toContain("@");
    expect(DEMO_AGENT_PASSWORD.length).toBeGreaterThanOrEqual(8);
    expect(DEMO_OTP_CODE).toHaveLength(6);
  });
});
