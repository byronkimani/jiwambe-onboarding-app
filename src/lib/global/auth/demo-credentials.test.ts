import { describe, expect, it } from "vitest";
import {
  DEMO_AGENT_EMAIL,
  DEMO_AGENT_PASSWORD,
  DEMO_OTP_CODE,
  isValidOfficerEmail,
  isValidOfficerPassword,
} from "@/lib/global/auth/demo-credentials";

describe("demo officer credentials helpers", () => {
  it("accepts prototype-style email and 8+ character password", () => {
    expect(isValidOfficerEmail(DEMO_AGENT_EMAIL)).toBe(true);
    expect(isValidOfficerPassword(DEMO_AGENT_PASSWORD)).toBe(true);
    expect(DEMO_OTP_CODE).toHaveLength(6);
  });

  it("rejects invalid email and short password", () => {
    expect(isValidOfficerEmail("not-an-email")).toBe(false);
    expect(isValidOfficerPassword("short")).toBe(false);
  });
});
