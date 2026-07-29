import { describe, expect, it } from "vitest";
import {
  accessTokenNeedsRefresh,
  accessTokenExpiresAtMs,
} from "@/lib/global/auth/officer-auth-upstream";

describe("officer-auth-upstream helpers", () => {
  it("computes access token expiry from expires_in", () => {
    const now = Date.now();
    const expiresAt = accessTokenExpiresAtMs(60);
    expect(expiresAt).toBeGreaterThan(now + 59_000);
    expect(expiresAt).toBeLessThan(now + 61_000);
  });

  it("detects when refresh is needed within skew window", () => {
    const soon = Date.now() + 30_000;
    expect(accessTokenNeedsRefresh(soon)).toBe(true);
    const later = Date.now() + 10 * 60_000;
    expect(accessTokenNeedsRefresh(later)).toBe(false);
  });

  it("needs refresh when expiry missing", () => {
    expect(accessTokenNeedsRefresh(undefined)).toBe(true);
  });
});
