const SENSITIVE_KEY = /password|token|authorization|otp|refresh|secret/i;

export function scrubLogFields(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length > 200) return "[Filtered]";
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(scrubLogFields);
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(record)) {
      out[key] = SENSITIVE_KEY.test(key) ? "[Filtered]" : scrubLogFields(nested);
    }
    return out;
  }
  return value;
}
