import { describe, expect, it, beforeEach } from "vitest";
import {
  ACTIVATION_SESSION_COOKIE,
  buildActivationSessionCookieValue,
  buildResetSessionCookieValue,
  parseActivationSessionCookie,
  parseResetSessionCookie,
  RESET_SESSION_COOKIE,
} from "@/lib/global/auth/auth-cookies";

describe("auth-cookies", () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret-min-32-characters-long!!";
  });

  it("round-trips activation session payload", () => {
    const value = buildActivationSessionCookieValue("act_123", "j••••@example.com");
    const parsed = parseActivationSessionCookie(value);
    expect(parsed?.activation_session_id).toBe("act_123");
    expect(parsed?.email_masked).toBe("j••••@example.com");
  });

  it("round-trips reset session payload", () => {
    const value = buildResetSessionCookieValue("rst_123", "j••••@example.com");
    const parsed = parseResetSessionCookie(value);
    expect(parsed?.reset_session_id).toBe("rst_123");
  });

  it("rejects tampered cookie", () => {
    const value = buildActivationSessionCookieValue("act_123", "x@y.z");
    expect(parseActivationSessionCookie(`${value}tamper`)).toBeNull();
  });

  it("exports stable cookie names", () => {
    expect(ACTIVATION_SESSION_COOKIE).toContain("activation");
    expect(RESET_SESSION_COOKIE).toContain("reset");
  });
});
