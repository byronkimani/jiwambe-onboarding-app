import {
  accessTokenNeedsRefresh,
  refreshOfficerTokens,
} from "@/lib/global/auth/officer-auth-upstream";

export type OfficerJwtTokens = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  error?: string;
};

/** Refresh access token in-place when within skew window. Used by Auth.js jwt callback. */
export async function refreshOfficerJwtIfNeeded(
  jwt: OfficerJwtTokens,
): Promise<OfficerJwtTokens> {
  if (jwt.error === "RefreshError") {
    return jwt;
  }

  if (!jwt.refreshToken || !accessTokenNeedsRefresh(jwt.accessTokenExpiresAt)) {
    return jwt;
  }

  const refreshed = await refreshOfficerTokens(jwt.refreshToken);
  if (!refreshed.ok) {
    return { ...jwt, error: "RefreshError" };
  }

  return {
    ...jwt,
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
    error: undefined,
  };
}
