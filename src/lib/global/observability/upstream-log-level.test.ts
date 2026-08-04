import { describe, expect, it } from "vitest";
import { isExpectedUpstreamClientError } from "@/lib/global/observability/upstream-log-level";

describe("upstream-log-level", () => {
  it("treats auth 401 as expected", () => {
    expect(
      isExpectedUpstreamClientError("/v1/_demo/auth/login", 401),
    ).toBe(true);
  });

  it("treats auth 400 as expected", () => {
    expect(
      isExpectedUpstreamClientError("/v1/_demo/auth/password/change", 400),
    ).toBe(true);
  });

  it("does not treat non-auth 404 as expected", () => {
    expect(isExpectedUpstreamClientError("/v1/field/products", 404)).toBe(false);
  });

  it("does not treat auth 500 as expected", () => {
    expect(isExpectedUpstreamClientError("/v1/_demo/auth/login", 500)).toBe(
      false,
    );
  });
});
