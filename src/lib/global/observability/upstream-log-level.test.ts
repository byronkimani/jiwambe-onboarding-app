import { describe, expect, it } from "vitest";
import { isExpectedUpstreamClientError } from "@/lib/global/observability/upstream-log-level";

describe("upstream-log-level", () => {
  it("treats auth 401 as expected", () => {
    expect(
      isExpectedUpstreamClientError("/onboarding/auth/login", 401),
    ).toBe(true);
  });

  it("treats auth 400 as expected", () => {
    expect(
      isExpectedUpstreamClientError("/onboarding/auth/password/change", 400),
    ).toBe(true);
  });

  it("does not treat non-auth 404 as expected", () => {
    expect(isExpectedUpstreamClientError("/catalog/products", 404)).toBe(false);
  });

  it("does not treat auth 500 as expected", () => {
    expect(isExpectedUpstreamClientError("/onboarding/auth/login", 500)).toBe(
      false,
    );
  });
});
