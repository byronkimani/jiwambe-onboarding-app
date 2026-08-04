/** Matches upstream doc 01 §18 / SC-11 — same pattern as jiwambe-core-API-ke logging.py */
export const REQUEST_ID_HEADER = "X-Request-ID";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

export function isValidRequestId(value: string): boolean {
  return REQUEST_ID_PATTERN.test(value);
}

export function sanitizeRequestId(supplied: string | undefined): string {
  const trimmed = supplied?.trim();
  if (trimmed && isValidRequestId(trimmed)) {
    return trimmed;
  }
  return createRequestId();
}

export function resolveRequestId(headers: Headers): string | undefined {
  const value = headers.get(REQUEST_ID_HEADER)?.trim();
  if (!value || !isValidRequestId(value)) {
    return undefined;
  }
  return value;
}

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function ensureRequestId(headers: Headers): string {
  return sanitizeRequestId(headers.get(REQUEST_ID_HEADER) ?? undefined);
}
