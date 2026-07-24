/**
 * Prevent open redirects — only same-origin relative paths are allowed.
 */
export function sanitizeCallbackUrl(
  callbackUrl: string | null | undefined,
  fallback = "/",
): string {
  if (!callbackUrl) {
    return fallback;
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(callbackUrl, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
