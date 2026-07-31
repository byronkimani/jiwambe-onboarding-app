export const REQUEST_ID_HEADER = "x-request-id";

export function resolveRequestId(headers: Headers): string | undefined {
  const value = headers.get(REQUEST_ID_HEADER)?.trim();
  return value || undefined;
}

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function ensureRequestId(headers: Headers): string {
  return resolveRequestId(headers) ?? createRequestId();
}
