export function upstreamPath(suffix: string): string {
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `*/api/v1${normalized}`;
}
