const OFFICER_AUTH_UPSTREAM_PREFIX = "/onboarding/auth/";

/** Expected client outcomes on public auth routes — log at info, not warn. */
export function isExpectedUpstreamClientError(
  upstreamPath: string,
  status: number,
): boolean {
  if (!upstreamPath.startsWith(OFFICER_AUTH_UPSTREAM_PREFIX)) {
    return false;
  }
  return status === 400 || status === 401 || status === 403 || status === 429;
}
