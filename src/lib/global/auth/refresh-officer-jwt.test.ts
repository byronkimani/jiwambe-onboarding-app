import { describe, expect, it, vi, beforeEach } from "vitest";
import { refreshOfficerTokens } from "@/lib/global/auth/officer-auth-upstream";

vi.mock("@/lib/global/shared/upstream-request", () => ({
  upstreamRequest: vi.fn(),
}));

import { upstreamRequest } from "@/lib/global/shared/upstream-request";
import { refreshOfficerJwtIfNeeded } from "@/lib/global/auth/refresh-officer-jwt";

const upstreamRequestMock = vi.mocked(upstreamRequest);

describe("refreshOfficerTokens", () => {
  beforeEach(() => {
    upstreamRequestMock.mockReset();
  });

  it("returns new tokens on successful refresh", async () => {
    upstreamRequestMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "new_access",
          refresh_token: "new_refresh",
          expires_in: 3600,
        }),
        { status: 200 },
      ),
    );

    const result = await refreshOfficerTokens("old_refresh");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.accessToken).toBe("new_access");
      expect(result.refreshToken).toBe("new_refresh");
    }
  });

  it("returns false on 401 invalid_refresh", async () => {
    upstreamRequestMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid_refresh" }), {
        status: 401,
      }),
    );

    const result = await refreshOfficerTokens("bad_refresh");
    expect(result).toEqual({ ok: false });
  });

  it("returns false when access_token missing", async () => {
    upstreamRequestMock.mockResolvedValue(
      new Response(JSON.stringify({ refresh_token: "rt" }), { status: 200 }),
    );

    const result = await refreshOfficerTokens("rt");
    expect(result).toEqual({ ok: false });
  });
});

describe("refreshOfficerJwtIfNeeded", () => {
  beforeEach(() => {
    upstreamRequestMock.mockReset();
  });

  it("refreshes when access token is within skew window", async () => {
    upstreamRequestMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "rotated",
          refresh_token: "rotated_rt",
          expires_in: 3600,
        }),
        { status: 200 },
      ),
    );

    const result = await refreshOfficerJwtIfNeeded({
      accessToken: "old",
      refreshToken: "rt",
      accessTokenExpiresAt: Date.now() + 30_000,
    });

    expect(result.accessToken).toBe("rotated");
    expect(result.refreshToken).toBe("rotated_rt");
    expect(result.error).toBeUndefined();
  });

  it("sets RefreshError when refresh fails", async () => {
    upstreamRequestMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid_refresh" }), {
        status: 401,
      }),
    );

    const result = await refreshOfficerJwtIfNeeded({
      accessToken: "old",
      refreshToken: "rt",
      accessTokenExpiresAt: Date.now() + 30_000,
    });

    expect(result.error).toBe("RefreshError");
  });

  it("skips refresh when token still valid", async () => {
    const result = await refreshOfficerJwtIfNeeded({
      accessToken: "valid",
      refreshToken: "rt",
      accessTokenExpiresAt: Date.now() + 10 * 60_000,
    });

    expect(result.accessToken).toBe("valid");
    expect(upstreamRequestMock).not.toHaveBeenCalled();
  });
});
