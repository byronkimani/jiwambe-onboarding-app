import { describe, expect, it } from "vitest";
import { REQUEST_ID_HEADER } from "@/lib/global/observability/request-id";
import { officerAuthUpstreamOptions } from "@/lib/global/auth/officer-auth-upstream-options";

describe("officerAuthUpstreamOptions", () => {
  it("returns requestId from incoming request", () => {
    const request = new Request("http://localhost/api/onboarding/auth/login", {
      headers: { [REQUEST_ID_HEADER]: "req-auth-1" },
    });

    expect(officerAuthUpstreamOptions(request)).toEqual({
      requestId: "req-auth-1",
    });
  });

  it("merges accessToken with requestId", () => {
    const request = new Request("http://localhost/api/onboarding/auth/password/change", {
      headers: { [REQUEST_ID_HEADER]: "req-auth-2" },
    });

    expect(
      officerAuthUpstreamOptions(request, { accessToken: "token-1" }),
    ).toEqual({
      accessToken: "token-1",
      requestId: "req-auth-2",
    });
  });
});
