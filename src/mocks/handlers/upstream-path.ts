export function fieldUpstreamPath(suffix: string): string {
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `*/v1/field${normalized}`;
}

/** MSW-only password auth paths — not in production upstream field realm. */
export function demoAuthUpstreamPath(suffix: string): string {
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `*/v1/_demo/auth${normalized}`;
}

/** @deprecated Use fieldUpstreamPath */
export function upstreamPath(suffix: string): string {
  return fieldUpstreamPath(suffix);
}
