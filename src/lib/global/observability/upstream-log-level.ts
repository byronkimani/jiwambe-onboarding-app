const DEMO_AUTH_UPSTREAM_PREFIX = "/v1/_demo/auth/";

/** Expected client outcomes on public auth routes — log at info, not warn. */
export function isExpectedUpstreamClientError(
  upstreamPath: string,
  status: number,
): boolean {
  if (!upstreamPath.startsWith(DEMO_AUTH_UPSTREAM_PREFIX)) {
    return false;
  }
  return status === 400 || status === 401 || status === 403 || status === 429;
}
